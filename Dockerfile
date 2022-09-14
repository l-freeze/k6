# InfluxDB v2.x isn't supported by this output, if you are using it you may consider to use the extension https://github.com/grafana/xk6-output-influxdb"
# https://github.com/grafana/xk6-output-influxdb
FROM golang:1.18-alpine as builder
WORKDIR $GOPATH/src/go.k6.io/k6
ADD . .
RUN apk --no-cache add git
RUN go install go.k6.io/xk6/cmd/xk6@latest
#RUN xk6 build --with github.com/grafana/xk6-output-influxdb=. --output /tmp/k6
RUN xk6 build --with github.com/grafana/xk6-output-influxdb --output /tmp/k6

FROM alpine:3.14
RUN apk add --no-cache ca-certificates && \
    adduser -D -u 12345 -g 12345 k6
COPY --from=builder /tmp/k6 /usr/bin/k6

USER 12345
WORKDIR /home/k6
ENTRYPOINT ["k6"]