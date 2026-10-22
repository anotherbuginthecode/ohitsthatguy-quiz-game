terraform {
	backend "s3" {
		bucket         = "ohitsthatguy-tfstate"
		key            = "infra/client/terraform.tfstate"
		region         = "eu-west-1"
		encrypt        = true
		dynamodb_table = "ohitsthatguy-tfstate-lock"
	}
}

locals {
  # Strip "https://" and trailing slash to get the bare hostname for CloudFront origin
  api_gateway_domain = trimsuffix(trimprefix(var.api_gateway_endpoint, "https://"), "/")

  # Canonical domain; every other alias is 301-redirected here by the CloudFront Function
  primary_domain = "ohitsthatguy.com"

  # host => Route53 zone id (each host gets A/AAAA alias records to CloudFront)
  site_hosts = {
    "ohitsthatguy.com"     = aws_route53_zone.com.zone_id
    "www.ohitsthatguy.com" = aws_route53_zone.com.zone_id
  }
}

provider "aws" {
	region = "us-east-1" # North Virginia per ACM
  profile = "anotherbuginthecode"
}

provider "aws" {
	alias  = "eu"
	region = "eu-west-1"
  profile = "anotherbuginthecode"
}


resource "aws_s3_bucket_policy" "static_site_oac" {
	provider = aws.eu
	bucket   = aws_s3_bucket.static_site.id
	policy = jsonencode({
		Version = "2012-10-17"
		Statement = [
			{
				Effect = "Allow"
				Principal = {"Service": "cloudfront.amazonaws.com"}
				Action = ["s3:GetObject"]
				Resource = ["${aws_s3_bucket.static_site.arn}/*"]
				Condition = {
					StringEquals = {
						"AWS:SourceArn" = aws_cloudfront_distribution.cdn.arn
					}
				}
			}
		]
	})
}

# Domain registered on Namecheap: its nameservers must point to this zone (see output "com_name_servers")
resource "aws_route53_zone" "com" {
	name = "ohitsthatguy.com"

	lifecycle {
		prevent_destroy = true
	}
}

output "com_name_servers" {
	value       = aws_route53_zone.com.name_servers
	description = "Nameservers to set on Namecheap (Domain > Nameservers > Custom DNS)"
}

# Single certificate for every CloudFront alias (a distribution accepts only one)
resource "aws_acm_certificate" "site" {
	domain_name               = local.primary_domain
	subject_alternative_names = [for h in keys(local.site_hosts) : h if h != local.primary_domain]
	validation_method         = "DNS"

	lifecycle {
		create_before_destroy = true
	}
}

resource "aws_route53_record" "cert_validation" {
	for_each = {
		for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => dvo
	}

	zone_id         = local.site_hosts[each.key]
	name            = each.value.resource_record_name
	type            = each.value.resource_record_type
	records         = [each.value.resource_record_value]
	ttl             = 300
	# ACM reuses the same validation CNAME per domain, so the record may already exist
	allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
	certificate_arn         = aws_acm_certificate.site.arn
	validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

resource "aws_s3_bucket" "static_site" {
	provider      = aws.eu
	bucket        = "ohitsthatguy.xyz"
	force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "static_site" {
	provider = aws.eu
	bucket   = aws_s3_bucket.static_site.id
	index_document {
		suffix = "index.html"
	}
	error_document {
		key = "404.html"
	}
}


# Injects x-api-key server-side before forwarding to API Gateway — key never reaches the browser
resource "aws_cloudfront_function" "api_key_injector" {
  name    = "ohitsthatguy-api-key-injector"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = "function handler(event){var req=event.request;req.headers['x-api-key']={value:'${var.api_key}'};return req;}"
}

# 301-redirects www (and any other alias) to the canonical domain, preserving path and query string
resource "aws_cloudfront_function" "canonical_redirect" {
  name    = "ohitsthatguy-canonical-redirect"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-EOT
    function handler(event) {
      var req = event.request;
      var host = req.headers.host ? req.headers.host.value : '';
      if (host === '${local.primary_domain}') return req;
      var qs = Object.keys(req.querystring).map(function (k) {
        var p = req.querystring[k];
        var values = p.multiValue ? p.multiValue.map(function (v) { return v.value; }) : [p.value];
        return values.map(function (v) { return v === '' ? k : k + '=' + v; }).join('&');
      }).join('&');
      return {
        statusCode: 301,
        statusDescription: 'Moved Permanently',
        headers: { location: { value: 'https://${local.primary_domain}' + req.uri + (qs ? '?' + qs : '') } }
      };
    }
  EOT
}

resource "aws_cloudfront_origin_request_policy" "api" {
  name = "ohitsthatguy-api-origin-request-policy"

  cookies_config { cookie_behavior = "none" }

  headers_config {
    header_behavior = "whitelist"
    headers { items = ["origin", "x-api-key", "content-type"] }
  }

  query_strings_config { query_string_behavior = "all" }
}

resource "aws_cloudfront_origin_access_control" "oac" {
	name                              = "ohitsthatguy-oac"
	description                       = "OAC for S3 static site"
	origin_access_control_origin_type  = "s3"
	signing_behavior                   = "always"
	signing_protocol                   = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
	enabled             = true
	is_ipv6_enabled     = true
	comment             = "CDN for ohitsthatguy.com static site"
	default_root_object = "index.html"

				origin {
					domain_name              = aws_s3_bucket.static_site.bucket_regional_domain_name
					origin_id                = "s3-ohitsthatguy.xyz"
					origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
				}

				origin {
					domain_name = local.api_gateway_domain
					origin_id   = "api-gateway"

					custom_origin_config {
						http_port              = 80
						https_port             = 443
						origin_protocol_policy = "https-only"
						origin_ssl_protocols   = ["TLSv1.2"]
					}
				}

	# Routes /api/* to API Gateway; CloudFront Function injects x-api-key server-side
	ordered_cache_behavior {
		path_pattern     = "/api/*"
		allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
		cached_methods   = ["GET", "HEAD"]
		target_origin_id = "api-gateway"

		viewer_protocol_policy = "https-only"
		compress               = false

		# AWS managed CachingDisabled policy — API responses must not be cached
		cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
		origin_request_policy_id = aws_cloudfront_origin_request_policy.api.id

		function_association {
			event_type   = "viewer-request"
			function_arn = aws_cloudfront_function.api_key_injector.arn
		}
	}

	default_cache_behavior {
		allowed_methods  = ["GET", "HEAD"]
		cached_methods   = ["GET", "HEAD"]
		target_origin_id = "s3-ohitsthatguy.xyz"
		viewer_protocol_policy = "redirect-to-https"
		compress = true
		min_ttl = 0
		default_ttl = 3600
		max_ttl = 86400
		forwarded_values {
			query_string = false
			cookies {
				forward = "none"
			}
		}

		function_association {
			event_type   = "viewer-request"
			function_arn = aws_cloudfront_function.canonical_redirect.arn
		}
	}

	price_class = "PriceClass_100"

	viewer_certificate {
		acm_certificate_arn            = aws_acm_certificate_validation.site.certificate_arn
		ssl_support_method             = "sni-only"
		minimum_protocol_version       = "TLSv1.2_2021"
	}

	restrictions {
		geo_restriction {
			restriction_type = "none"
		}
	}

	aliases = keys(local.site_hosts)
}

resource "aws_route53_record" "site_a" {
	for_each = local.site_hosts

	zone_id = each.value
	name    = each.key
	type    = "A"
	alias {
		name                   = aws_cloudfront_distribution.cdn.domain_name
		zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
		evaluate_target_health = false
	}
}

resource "aws_route53_record" "site_aaaa" {
	for_each = local.site_hosts

	zone_id = each.value
	name    = each.key
	type    = "AAAA"
	alias {
		name                   = aws_cloudfront_distribution.cdn.domain_name
		zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
		evaluate_target_health = false
	}
}
