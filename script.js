import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '3s', target: 2},
        { duration: '1m5s', target: 10},
        { duration: '2s', target: 0},
    ]
};

export function setup() {
    return {accessToken: "ACCESS_TOKEN"}
}

export default function (setUpData) {
    const res = http.get('https://httpbin.test.k6.io/');
    check(res, { 'status was 200': (r) => r.status == 200 });
    sleep(1);
    console.log(setUpData);
}

export function teardown(setUpData) {
    console.log(setUpData);
}
