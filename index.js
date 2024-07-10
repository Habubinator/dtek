const TelegramBot = require("node-telegram-bot-api");
const { text } = require("stream/consumers");
require("dotenv").config();
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });
const userMap = new Map();
userMap.set(513950472, { someData: true });
let light = {
    end_date: "00:00 11.07.2024",
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userMap.set(chatId, { someData: true });
    bot.sendMessage(chatId, `Відстежую в цьому чаті`);
    bot.sendMessage(
        chatId,
        `Наступне відключення буде: \nз ${light.start_date} до ${light.end_date}`
    );
});

async function getLight() {
    return await (
        await fetch("https://www.dtek-oem.com.ua/ua/ajax", {
            headers: {
                accept: "application/json, text/javascript, */*; q=0.01",
                "accept-language":
                    "ru-RU,ru;q=0.9,uk-UA;q=0.8,uk;q=0.7,en-US;q=0.6,en;q=0.5",
                "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                priority: "u=1, i",
                "sec-ch-ua":
                    '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrf-token":
                    "x30CoZhcmYug60O4HB_pioclRsx8Sg9VEiaktUOpGCSgH2zxoT-p6se5N9JVWpq49mkLugUGbjpQaurjIpBOQQ==",
                "x-requested-with": "XMLHttpRequest",
                cookie: "Domain=dtek-oem.com.ua; _language=4feef5ffdc846bbf9c35c97292b7b3e6c48117a536a6462b530e0984a39d6bd4a%3A2%3A%7Bi%3A0%3Bs%3A9%3A%22_language%22%3Bi%3A1%3Bs%3A2%3A%22uk%22%3B%7D; visid_incap_2398477=p/NPWIRhRBeif1rIgoAfwmyJfmYAAAAAQUIPAAAAAAAyWUc5XbQ+Xuus4l2WW5rx; dtek-oem=r73fupmikkrh6lld6d7ihl44b2; _csrf-dtek-oem=d8c0cb0899b4e37e1e087d095f1176d848d3a857937e38a55064781fc3edb61ba%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-dtek-oem%22%3Bi%3A1%3Bs%3A32%3A%22gbnP9c0agRtjIEs2qLMvyLaoBLNVa9Ve%22%3B%7D; incap_ses_324_2398477=dBAMSUQi21qHz3EqYhR/BK3wjmYAAAAAj/G+fT0bf1HuTQM8NUvZNA==; _ga_B5BT53GY2T=GS1.1.1720643761.2.0.1720643761.60.0.0; _ga=GA1.3.2097735987.1719568751; _gid=GA1.3.1458168588.1720643761; _gat_gtag_UA_141782039_1=1; incap_wrt_377=s/COZgAAAACv/e0bGQAI+QIQ3/ONwCkY3+O7tAYgAiit4bu0BjABiUGD4o6KFGFIUEvwK0ecUg==",
                Referer: "https://www.dtek-oem.com.ua/ua/shutdowns",
                "Referrer-Policy": "origin-when-cross-origin",
            },
            body: "method=getHomeNum&data%5B0%5D%5Bname%5D=city&data%5B0%5D%5Bvalue%5D=%D1%81%D0%BC%D1%82+%D0%9E%D0%B2%D1%96%D0%B4%D1%96%D0%BE%D0%BF%D0%BE%D0%BB%D1%8C&data%5B1%5D%5Bname%5D=street&data%5B1%5D%5Bvalue%5D=%D0%BF%D1%80%D0%BE%D0%B2.+%D0%9E%D1%82%D1%80%D0%B0%D0%B4%D0%BD%D0%B8%D0%B9",
            method: "POST",
        })
    ).json();
}

async function checkIfLightChanged() {
    temp = (await getLight()).data["2А"];
    const date1 = new Date(temp.end_date);
    const date2 = new Date(light.end_date);
    console.log(temp);
    if (date1 > date2) {
        light = temp;
        for (let userId of [...userMap.keys()]) {
            bot.sendMessage(
                userId,
                `Наступне відключення буде: \nз ${light.start_date} до ${light.end_date}`
            );
        }
    }
}
checkIfLightChanged().then(() => {
    setInterval(checkIfLightChanged, 1000 * 60 * 1);
});
