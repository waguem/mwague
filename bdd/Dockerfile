FROM python:slim as builder

RUN apt update && apt install curl maven jq -y && \
    mkdir -p /opt/bin && \
    curl https://raw.githubusercontent.com/OpenAPITools/openapi-generator/master/bin/utils/openapi-generator-cli.sh > /opt/bin/openapi-generator-cli && \
    chmod u+x /opt/bin/openapi-generator-cli

WORKDIR /app/build
ENV PATH="${PATH}:/opt/bin"
COPY ./openapi.json .
RUN ls -al
RUN /opt/bin/openapi-generator-cli generate -i ./openapi.json -g python -o ./gen/client --package-name client

WORKDIR /app/build/gen/client
RUN python3 setup.py install --user

FROM python:slim as runner

WORKDIR /app
COPY ./tests ./tests
COPY ./pyproject.toml .
RUN pip install -e .

COPY --from=builder /app/build/gen/client/build/ /app/gen/client/build
