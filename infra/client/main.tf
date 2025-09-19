
terraform {
	backend "s3" {
		bucket         = "ohitsthatguy-tfstate"
		key            = "infra/client/terraform.tfstate"
		region         = "eu-west-1"
		encrypt        = true
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

resource "aws_s3_bucket_policy" "static_site_policy" {
	provider = aws.eu
	bucket   = aws_s3_bucket.static_site.id
	policy = jsonencode({
		Version = "2012-10-17"
		Statement = [
			{
				Effect = "Allow"
				Principal = "*"
				Action = ["s3:GetObject"]
				Resource = ["${aws_s3_bucket.static_site.arn}/*"]
			}
		]
	})
}

resource "aws_cloudfront_distribution" "cdn" {
	enabled             = true
	is_ipv6_enabled     = true
	comment             = "CDN for ohitsthatguy.xyz static site"
	default_root_object = "index.html"

		origin {
			domain_name = "${aws_s3_bucket.static_site.bucket}.s3-website-eu-west-1.amazonaws.com"
			origin_id   = "s3-ohitsthatguy.xyz"
			custom_origin_config {
				http_port              = 80
				https_port             = 443
				origin_protocol_policy = "http-only"
				origin_ssl_protocols   = ["TLSv1.2"]
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
