resource "aws_ses_domain_identity" "domain" {
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "dkim" {
  domain          = aws_ses_domain_identity.domain.domain
  depends_on      = [aws_ses_domain_identity.domain]
}

resource "aws_ses_email_identity" "email" {
  email = var.email_identity
}
