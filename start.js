import api from "./api.js"
import CryptoJS from "crypto-js"


(async () => {
    let username = 'admin'
    let password = 'admin'
    let month = 10
    let host = 'http://127.0.0.1:7789'

    password = password ? CryptoJS.MD5(password).toString() : '';
    let res = await api.post(host + '/api/login', {
        'username': username,
        'password': password
    })
    api.authorization = res.data

    res = await api.post(host + '/api/mikan', {})
    let items = res.data.items
        .map(it => it.items)
        .flat()
    for (let item of items) {
        console.log("===================")
        let url = item.url
        let title = item.title
        res = await api.get(host + '/api/mikan/group?url=' + url)
        let rssList = res.data
            .filter(it => it.label === 'ANi')
            .map(it => it['rss'])

        if (!rssList.length) {
            console.log(`${title} 没有ANi源`);
            continue
        }
        let rss = rssList[0]
        res = await api.post(host + '/api/rss', {
            'type': 'mikan',
            'url': rss
        })
        if (res.month !== month) {
            console.log(`${title} 非${month}月`)
            continue
        }
        res.data['backRssList'] = [
            {label: "ANi", url: rss}
        ]
        try {
            res = await api.post(host + '/api/ani', res.data)
            console.log(`${title} ${res.message}`);
        } catch (e) {
            console.log(`${title} ${e.message}`);
        }
    }

})()
