#!/bin/bash

# ensure pre-commit is installed
pre-commit install

# npm install in /website
cd website
pnpm install
cd ..
