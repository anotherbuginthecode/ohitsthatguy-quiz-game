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

data "aws_acm_certificate" "cert" {
	domain   = "ohitsthatguy.xyz"
	statuses = ["ISSUED"]
	most_recent = true
}

data "aws_route53_zone" "primary" {
	name         = "ohitsthatguy.xyz."
	private_zone = false
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
	comment             = "CDN for ohitsthatguy.xyz static site"
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
	}

	price_class = "PriceClass_100"

	viewer_certificate {
		acm_certificate_arn            = data.aws_acm_certificate.cert.arn
		ssl_support_method             = "sni-only"
		minimum_protocol_version       = "TLSv1.2_2021"
	}

	restrictions {
		geo_restriction {
			restriction_type = "none"
		}
	}

	aliases = ["ohitsthatguy.xyz"]
}

resource "aws_route53_record" "site" {
	zone_id = data.aws_route53_zone.primary.zone_id
	name    = "ohitsthatguy.xyz"
	type    = "A"
	alias {
		name                   = aws_cloudfront_distribution.cdn.domain_name
		zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
		evaluate_target_health = false
	}
}
