負荷テスト実行
```
$ docker-compose run --rm k6 run --out csv=/output/script_result.csv - < script.js
```

influxdb初期化
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
