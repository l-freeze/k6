import http from 'k6/http';
import { check, sleep } from 'k6';

const FQDN = 'nginx';
const URLs = {
    '20x': 'http://' + FQDN,
    '40x': 'http://' + FQDN + '/404',
    '50x': 'http://' + FQDN + '/50x.html',
};

export const options = {
    stages: [
        { duration: '3s', target: 2},
        { duration: '1m5s', target: 10},
        { duration: '2s', target: 0},
    ]
};

export function setup() {
    return {accessToken: "ACCESS_TOKEN_ABC"}
}

export default function (setUpData) {
    const payload = JSON.stringify({
        'email': 'l-freeze@example.com',
        'password': 'password',
    });
    const params = {
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + setUpData.accessToken,
        },
    }
    const res = http.get(URLs['20x'], payload, params);
    check(res, { 'status was 200': (r) => r.status == 200 });
}

export function teardown(setUpData) {
    console.log(setUpData);
}
