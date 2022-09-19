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

結果の見方（予想）
```
     ✓ in status 200
     ✓ authckeck successed

     █ setup

     █ teardown

     checks.........................: 100.00% ✓ 577652      ✗ 0
     Counting.......................: 288826  9624.867009/s
     data_received..................: 253 MB  8.4 MB/s
     data_sent......................: 36 MB   1.2 MB/s
     http_req_blocked...............: avg=101µs    min=688ns    med=2.79µs  max=215.63ms p(90)=6.06µs  p(95)=9.77µs
     http_req_connecting............: avg=92.7µs   min=0s       med=0s      max=215.55ms p(90)=0s      p(95)=0s
     http_req_duration..............: avg=23.96ms  min=87.4µs   med=17.17ms max=1.22s    p(90)=53.3ms  p(95)=71.44ms
       { expected_response:true }...: avg=23.96ms  min=87.4µs   med=17.17ms max=1.22s    p(90)=53.3ms  p(95)=71.44ms
     http_req_failed................: 0.00%   ✓ 0           ✗ 288827
     http_req_receiving.............: avg=181.29µs min=9.79µs   med=34.2µs  max=176.39ms p(90)=84.33µs p(95)=138.38µs
     http_req_sending...............: avg=183.34µs min=4.27µs   med=12.52µs max=749.56ms p(90)=32.97µs p(95)=50.95µs
     http_req_tls_handshaking.......: avg=0s       min=0s       med=0s      max=0s       p(90)=0s      p(95)=0s
     http_req_waiting...............: avg=23.6ms   min=49.93µs  med=16.93ms max=1.22s    p(90)=52.56ms p(95)=70.47ms
     http_reqs......................: 288827  9624.900333/s
     iteration_duration.............: avg=42.55ms  min=177.17µs med=28.03ms max=1.31s    p(90)=98.21ms p(95)=138.49ms
     iterations.....................: 288826  9624.867009/s
     vus............................: 25      min=0         max=988
     vus_max........................: 1099    min=1099      max=109

http_reqs...トータルリクエスト数（アクセス数/秒）
vus_max...瞬間最大風速（同時アクセス数）
iterations...シナリオ実行回数
http_req_failed...文字通りリクエスト失敗の割合か？localだと失敗しないので不明
```

テストケースの考え方
```
https://k6.io/docs/test-types/introduction/
を参考に
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



# ローカルで試す時のコマンドメモ
```
$ docker-compose down; docker volume prune -f; docker-compose build --no-cache; docker-compose up -d;
$ docker-compose run --rm k6 run -o xk6-influxdb=http://influxdb:8086/k6db - < script_local.js
```


# コンテナのメモリー使用量上限確認
```
$ docker stats
```
上限設定しないで何発もやってたらERROR 137が返されるようになってしまった