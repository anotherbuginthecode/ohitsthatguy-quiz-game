locals {
  ecr_lifecycle_policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Expire untagged images after 7 days"
      selection = {
        tagStatus   = "untagged"
        countType   = "sinceImagePushed"
        countUnit   = "days"
        countNumber = 7
      }
      action = {
        type = "expire"
      }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "get_actors" {
  repository = aws_ecr_repository.lambda_repo.name
  policy     = local.ecr_lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "get_rounds" {
  repository = data.aws_ecr_repository.get_rounds.name
  policy     = local.ecr_lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "get_gameset" {
  repository = data.aws_ecr_repository.get_gameset.name
  policy     = local.ecr_lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "store_events" {
  repository = data.aws_ecr_repository.store_events.name
  policy     = local.ecr_lifecycle_policy
}
