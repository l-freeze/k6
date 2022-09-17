//docker-compose run --rm k6 run -o xk6-influxdb=http://influxdb:8086/k6db - < script_local.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const FQDN = 'k6-web';
const URLs = {
    'Auth': `http://${FQDN}/auth`,
    '_20x': `http://${FQDN}`,
    '_40x': `http://${FQDN}/404`,
    '_50x': `http://${FQDN}/50x.html`,
    'post': `http://${FQDN}/post`,
    'put': `http://${FQDN}/put`,
};

//https://k6.io/docs/getting-started/running-k6/#stages-ramping-up-down-vus
//高度なoptionはシナリオ使え、との事
//シナリオ：https://k6.io/docs/using-k6/scenarios#configuration
/*
export const options = {
    stages: [
        //--------
        // duration: 試行時間（負荷をかける時間）
        // target: 同時接続数 (cliオプションの --vus)
        //--------
        { duration: '3s', target: 2},
        //{ duration: '1m5s', target: 10},
        //{ duration: '2s', target: 0},
    ]
};
*/

//総アクセス数で負荷掛けるのが普通だろうからexecutorはshared-iterationsが良さそうだ
export const options = {
    scenarios: {
        //100user * 10access
        scenario_01: {
            // name of the executor to use
            //executor: 'shared-iterations',
            executor: 'per-vu-iterations',//1vuに対してiteration回試行させる
            // https://k6.io/docs/using-k6/scenarios/executors/per-vu-iterations/

            exec: 'access20x',

            // common scenario configuration
            startTime: '0s',
            gracefulStop: '15s',
            env: { EXAMPLEVAR: 'testing' },
            tags: { 
                'author': 'l-freeze',
            },

            // executor-specific configuration
            vus: 100,
            iterations: 10,
            maxDuration: '10s',
        },

    /*
        // 2000access/2000user (1user 1access)
        scenario_11: {
            //executor: 'per-vu-iterations',
            executor: 'shared-iterations',//2000vuで合計iteration回試行できればOK。1vuが何回リクエストするかは問わない
            //https://k6.io/docs/using-k6/scenarios/executors/shared-iterations/

            exec: 'access40x',

            startTime: '5s',
            gracefulStop: '15s',
            env: { EXAMPLEVAR: 'testing' },
            tags: { 
                'author': 'l-freeze',
            },  

            vus: 2000,
            iterations: 2000,
            maxDuration: '10s',
        },

        //40000access/100user (100user 40access)
        scenario_21: {
            //executor: 'per-vu-iterations',
            executor: 'shared-iterations',
            exec: 'access50x',

            startTime: '10s',
            gracefulStop: '15s',
            env: { EXAMPLEVAR: 'testing' },
            tags: { 
                'author': 'l-freeze',
            },  

            vus: 100,
            iterations: 40000,
            maxDuration: '10s',
        },
    */


        //オートスケールのテストするならramping-vusが良いかもしれん
        /*
        scenario_31: {
            startTime: '5s',
            executor: 'ramping-vus',
            exec: 'access20x',
            stages: [
                { duration: '20s', target: 1000 },//20秒掛けて100VUに
                { duration: '5s', target: 0 },//5秒掛けて0VUに
            ],
            gracefulRampDown: '10s',//0にするとリクエスト中でもぶった切られるので
            gracefulStop: '15s',
            env: { EXAMPLEVAR: 'testing' },
            tags: { 
                'author': 'l-freeze',
            },
        },
        */

        //putのシナリオ
        scenario_41: {
            executor: 'per-vu-iterations',
            exec: 'access_put',

            startTime: '3s',
            gracefulStop: '0',
            env: { EXAMPLEVAR: 'testing' },
            tags: { 
                'author': 'l-freeze',
            },  

            vus: 1,
            iterations: 1,
            maxDuration: '10s',
        },
    },
};
  
const counter = new Counter('Counting');

export function setup() {
    console.log(URLs.Auth);
    const res = http.get(URLs.Auth);
    /*
    for (const p in res.headers) {
        if (res.headers.hasOwnProperty(p)) {
          console.log(p + ' : ' + res.headers[p]);
        }
      }    
    const token = res.headers;
    */

    const token = res.headers.Authorization;
    return {token};
    //curl -I -H "X-TOKEN: l-freeze" localhost:80
}

export default function (setUpData) {
    counter.add(1);
    const payload = JSON.stringify({
        'email': 'l-freeze@example.com',
        'password': 'password',
    });
    const params = {
        'headers': {
            'Content-Type': 'application/json',
            'X-token': setUpData.token,
        },
    }
    const res = http.get(URLs._20x, params);
    //const res = http.post(URLs._20x, payload, params);

    check(res, { 
        'in status 200': (r) => r.status === 200 ,
        'authckeck successed': (r) => r.headers['Auth-Check'] === 'Successed' ,
        'authckeck failed': (r) => r.headers['Auth-Check'] === 'Failed' ,
    });
    //check(res, { 'status was 200': (r) => r.status == 200 });
    //check(res, { 'authckeck is ': (r) => r.headers['Auth-Check'] });
    //check(res, { 'authckeck result ': (r) => r.headers['Auth-Check'] == 'Successed' });
    //check(res, { 'status was 200': (r) => r.headers['Auth-Check'] == 'Failed' });
}

export function access20x(setUpData) {
    counter.add(1);
    const params = {
        'headers': {
            'Content-Type': 'application/json',
            'X-token': setUpData.token,
        },
    }
    const res = http.get(URLs._20x, params);

    check(res, { 
        'in status 200': (r) => r.status === 200 ,
        'authckeck successed': (r) => r.headers['Auth-Check'] === 'Successed' ,
    });
}

export function access40x(setUpData) {
    counter.add(1);
    const params = {
        'headers': {
            'Content-Type': 'application/json',
            'X-token': setUpData.token,
        },
    }
    const res = http.get(URLs._40x, params);

    check(res, { 
        'in status 404': (r) => r.status === 404 ,
    });
}

export function access50x(setUpData) {
    counter.add(1);
    const params = {
        'headers': {
            'Content-Type': 'application/json',
            'X-token': setUpData.token,
        },
    }
    const res = http.get(URLs._50x, params);

    check(res, { 
        'in status 500': (r) => r.status === 500 ,
    });
}

export function access_put(setUpData) {
    counter.add(1);
    const payload = JSON.stringify({
        'email': 'l-freeze@example.com',
        'password': 'password',
    });
    const res = http.put(URLs.put, payload);
    console.log(res);

    check(res, { 
        'in status 204': (r) => r.status === 204 ,
    });
}


export function teardown(setUpData) {
    console.log(setUpData);
}
