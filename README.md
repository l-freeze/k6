# influxdb
~influxdb初期化~　envに任せるので不要
```
$ docker-compose exec influxdb bash
root@e6df1c963834:/# influx setup
> Welcome to InfluxDB 2.0!
? Please type your primary username admin
? Please type your password **********
? Please type your password again **********
? Please type your primary organization name k6
? Please type your primary bucket name k6
? Please type your retention period in hours, or 0 for infinite 0
? Setup with these parameters?
  Username:          admin
  Organization:      k6
  Bucket:            k6
  Retention Period:  infinite
 Yes
User    Organization    Bucket
admin   k6              k6
root@e6df1c963834:/# influx config list
Active  Name    URL                     Org
*       default http://localhost:8086   k6
```

influxdbログイン
http://localhost:8086/orgs/7a13dac9d41e5d25/load-data/file-upload/csv
サイドバーの`Load Data`を押す
File UploadのCSV Dataを押す


# k6

実行 - 結果の出力先はinfluxdbのコンテナに入る（K6_OUTで指定しているので）
```
$ docker-compose run --rm k6 run - < script.js
```

実行 - 結果の出力先はjsonとinfluxdbになる
```
#$ docker-compose run --rm k6 run -o json=/output/result.json -o xk6-influxdb=http://influxdb:8086/k6db - < script.js
```

実行
```
#$ docker-compose run --rm k6 run -o xk6-influxdb=http://influxdb:8086/k6db - < script.js
```

実行
```
$ docker-compose run --rm k6 run --out csv=/output/script_result.csv - < script.js
```

# grafana
ログイン
```
admin/password
```

サイドバーの下の方の歯車押す > Data sources > influxdb
```
Query Language: Flux

URL: http://influxdb:8086
Access: Server(default)


Header: Authorization
Value: Token TOKEN_TOKEN

Organization: k6
Default Bucket: k6db
```
Explore