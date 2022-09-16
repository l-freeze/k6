import http from 'k6/http';
import { check, sleep } from 'k6';

const FQDN = 'k6-web';
const URLs = {
    'Auth': `http://${FQDN}/auth`,
    '_20x': `http://${FQDN}`,
    '_40x': `http://${FQDN}/404`,
    '_50x': `http://${FQDN}/50x.html`,
};

export const options = {
    stages: [
        { duration: '3s', target: 2},
        //{ duration: '1m5s', target: 10},
        //{ duration: '2s', target: 0},
    ]
};

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

    check(res, { 'status was 200': (r) => r.status == 200 });
    check(res, { 'status was 200': (r) => r.headers['Auth-Check'] == 'Successed' });
    //check(res, { 'status was 200': (r) => r.headers['Auth-Check'] == 'Failed' });
}

export function teardown(setUpData) {
    console.log(setUpData);
}
