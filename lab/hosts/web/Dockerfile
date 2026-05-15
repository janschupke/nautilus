FROM php:8.3-apache

RUN apt-get update \
  && apt-get install -y --no-install-recommends libpq-dev \
  && docker-php-ext-install pdo_pgsql \
  && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite headers

COPY lab/hosts/web/site/ /var/www/html/

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
