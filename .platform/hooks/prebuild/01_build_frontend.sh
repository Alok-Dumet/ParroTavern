#!/bin/bash
set -e

cd /var/app/staging
npm --prefix frontend install
npm --prefix frontend run build
