// ==UserScript==
// @name         Auto Japanese Typer (Lite)
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  不要な処理（記号スキップ、特殊なch/んの判定、外部ソース解析）を削除した軽量版
// @author       Ryu-376
// @match        https://otonasi-muonn.github.io/typing_game/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ユーザー設定：タイピングの間隔（ミリ秒）
    const TYPING_SPEED = 100; 

    // かな→ローマ字変換マップ
    const kanaMap = {
        "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
        "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
        "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
        "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
        "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
        "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
        "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
        "や": "ya", "ゆ": "yu", "よ": "yo",
        "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
        "わ": "wa", "を": "wo", "ん": "nn", // 「ん」は常にnnで打つ仕様に統一して処理を簡略化

        "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
        "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
        "だ": "da", "ぢ": "di", "づ": "du", "で": "de", "ど": "do",
        "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
        "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",

        "ぁ": "xa", "ぃ": "xi", "ぅ": "xu", "ぇ": "xe", "ぉ": "xo",
        "っ": "xtu", "ゃ": "xya", "ゅ": "xyu", "ょ": "xyo",
        "ゎ": "xwa", "ー": "-",

        "きぇ": "kye", "きょ": "kyo", "きゅ": "kyu", "きゃ": "kya", "きぃ": "kyi",
        "しぇ": "she", "しょ": "sho", "しゅ": "shu", "しゃ": "sha", "しぃ": "syi",
        "ちぇ": "che", "ちょ": "cho", "ちゅ": "chu", "ちゃ": "cha", "ちぃ": "cyi",
        "にぇ": "nye", "にょ": "nyo", "にゅ": "nyu", "にゃ": "nya", "にぃ": "nyi",
        "ひぇ": "hye", "ひょ": "hyo", "ひゅ": "hyu", "ひゃ": "hya", "ひぃ": "hyi",
        "みぇ": "mye", "みょ": "myo", "みゅ": "myu", "みゃ": "mya", "みぃ": "myi",
        "りぇ": "rye", "りょ": "ryo", "りゅ": "ryu", "りゃ": "rya", "りぃ": "ryi",
        "ぎぇ": "gye", "ぎょ": "gyo", "ぎゅ": "gyu", "ぎゃ": "gya", "ぎぃ": "gyi",
        "じぇ": "je",  "じょ": "jo",  "じゅ": "ju",  "じゃ": "ja",  "じぃ": "jyi",
        "びぇ": "bye", "びょ": "byo", "びゅ": "byu", "びゃ": "bya", "びぃ": "byi",
        "ぴぇ": "pye", "ぴょ": "pyo", "ぴゅ": "pyu", "ぴゃ": "pya", "ぴぃ": "pyi",
        "うぃ": "wi",  "うぇ": "we",  "うぉ": "who", "ゔぁ": "va",  "ゔぃ": "vi",
        "ゔ":   "vu",  "ゔぇ": "ve",  "ゔぉ": "vo",  "てぃ": "thi", "でぃ": "dhi",
        "とぅ": "twu", "どぅ": "dwu", "ふぁ": "fa",  "ふぃ": "fi",  "ふぇ": "fe",
        "ふぉ": "fo",  "ちぃ": "cyi"
    };

    let isRunning = false;
    let typingTimer = null;

    // ひらがな文字列をローマ字の配列に変換する関数
    function kanaToRomaji(kanaStr) {
        let result = [];
        let i = 0;

        while (i < kanaStr.length) {
            // 1. 2文字の組み合わせ（「きゃ」「しゅ」など）をチェック
            if (i + 1 < kanaStr.length) {
                let doubleChar = kanaStr.substring(i, i + 2);
                if (kanaMap[doubleChar]) {
                    result.push(kanaMap[doubleChar]);
                    i += 2;
                    continue;
                }
            }

            // 2. 1文字をチェック
            let singleChar = kanaStr.charAt(i);
            
            // 促音（小さい「っ」）の処理：次の文字の子音を重ねる
            if (singleChar === "っ" && i + 1 < kanaStr.length) {
                let nextChar = kanaStr.charAt(i + 1);
                // 次が2文字の組み合わせかチェック
                let nextDouble = (i + 2 < kanaStr.length) ? kanaStr.substring(i + 1, i + 3) : null;
                let nextRomaji = (nextDouble && kanaMap[nextDouble]) ? kanaMap[nextDouble] : kanaMap[nextChar];

                if (nextRomaji) {
                    // 子音の最初の1文字を足す
                    result.push(nextRomaji.charAt(0));
                    i += 1;
                    continue;
                }
            }

            // 通常の文字変換
            if (kanaMap[singleChar]) {
                result.push(kanaMap[singleChar]);
            } else {
                // マップにない文字（英数字など）はそのまま出力
                result.push(singleChar);
            }
            i += 1;
        }

        // 文字列として結合してから、1文字ずつの配列に分解して返す
        return result.join("").split("");
    }

    // 擬似キーボード入力を発生させる関数
    function simulateKey(char) {
        const key = char === " " ? "Space" : char;
        const keyCode = char === " " ? 32 : char.toUpperCase().charCodeAt(0);

        const events = ['keydown', 'keypress', 'input', 'keyup'];
        events.forEach(type => {
            const ev = new ClientEvent(type, {
                bubbles: true,
                cancelable: true,
                key: key,
                char: char,
                keyCode: keyCode,
                which: keyCode
            });
            document.activeElement || document.body.dispatchEvent(ev);
        });
    }

    // 画面から問題文（ひらがな）を抽出する関数
    function getActiveQuestion() {
        // ※ 対象サイトのHTML構造に合わせてセレクタを調整してください
        // 例: document.querySelector('.question-text') など
        const elements = document.querySelectorAll('div, span, p');
        for (let el of elements) {
            const text = el.innerText.trim();
            // ひらがな、カタカナ、またはー（長音）が含まれている要素を簡易判定
            if (/^[ぁ-んァ-ヶー\s]+$/.test(text) && text.length > 0) {
                return text;
            }
        }
        return null;
    }

    // 自動タイピングのメインループ
    function startTypingLoop() {
        if (!isRunning) return;

        const currentQuestion = getActiveQuestion();
        if (!currentQuestion) {
            // 問題文が見つからない場合は少し待って再試行
            typingTimer = setTimeout(startTypingLoop, 500);
            return;
        }

        // ひらがなをローマ字キーの配列に変換
        const keyQueue = kanaToRomaji(currentQuestion);
        let keyIndex = 0;

        function typeNextKey() {
            if (!isRunning) return;

            // 1問分のタイピングが終了したら次の問題を監視
            if (keyIndex >= keyQueue.length) {
                typingTimer = setTimeout(startTypingLoop, 300);
                return;
            }

            simulateKey(keyQueue[keyIndex]);
            keyIndex++;
            typingTimer = setTimeout(typeNextKey, TYPING_SPEED);
        }

        typeNextKey();
    }

    // スクリプトの開始と停止を制御するグローバルオブジェクト（安全装置用）
    window.__autoJapaneseTyper = {
        start: function() {
            if (isRunning) return;
            isRunning = true;
            console.log("Auto Typer Started");
            startTypingLoop();
        },
        stop: function() {
            isRunning = false;
            if (typingTimer) clearTimeout(typingTimer);
            console.log("Auto Typer Stopped");
        }
    };

    // 起動
    window.__autoJapaneseTyper.start();

})();
