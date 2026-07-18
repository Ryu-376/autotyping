(async () => {
    "use strict";

    if (window.__autoJapaneseTyper?.stop) {
        window.__autoJapaneseTyper.stop();
    }

    const CONFIG = {
        questionSelector: "#question-text",
        toggleKey: "F8",
        initialDelay: 0,
        keyDelay: 0,
        randomDelay: 0,
        nextQuestionDelay: 0,
        debug: true
    };

    const kanaMap = {
        "あ": "a",
        "い": "i",
        "う": "u",
        "え": "e",
        "お": "o",

        "か": "ka",
        "き": "ki",
        "く": "ku",
        "け": "ke",
        "こ": "ko",

        "さ": "sa",
        "し": "shi",
        "す": "su",
        "せ": "se",
        "そ": "so",

        "た": "ta",
        "ち": "chi",
        "つ": "tsu",
        "て": "te",
        "と": "to",

        "な": "na",
        "に": "ni",
        "ぬ": "nu",
        "ね": "ne",
        "の": "no",

        "は": "ha",
        "ひ": "hi",
        "ふ": "fu",
        "へ": "he",
        "ほ": "ho",

        "ま": "ma",
        "み": "mi",
        "む": "mu",
        "め": "me",
        "も": "mo",

        "や": "ya",
        "ゆ": "yu",
        "よ": "yo",

        "ら": "ra",
        "り": "ri",
        "る": "ru",
        "れ": "re",
        "ろ": "ro",

        "わ": "wa",
        "ゐ": "wi",
        "ゑ": "we",
        "を": "wo",
        "ん": "n",

        "が": "ga",
        "ぎ": "gi",
        "ぐ": "gu",
        "げ": "ge",
        "ご": "go",

        "ざ": "za",
        "じ": "ji",
        "ず": "zu",
        "ぜ": "ze",
        "ぞ": "zo",

        "だ": "da",
        "ぢ": "ji",
        "づ": "zu",
        "で": "de",
        "ど": "do",

        "ば": "ba",
        "び": "bi",
        "ぶ": "bu",
        "べ": "be",
        "ぼ": "bo",

        "ぱ": "pa",
        "ぴ": "pi",
        "ぷ": "pu",
        "ぺ": "pe",
        "ぽ": "po",

        "ぁ": "a",
        "ぃ": "i",
        "ぅ": "u",
        "ぇ": "e",
        "ぉ": "o",
        "ゔ": "vu",

        "きゃ": "kya",
        "きゅ": "kyu",
        "きょ": "kyo",

        "しゃ": "sha",
        "しゅ": "shu",
        "しぇ": "she",
        "しょ": "sho",

        "ちゃ": "cha",
        "ちゅ": "chu",
        "ちぇ": "che",
        "ちょ": "cho",

        "にゃ": "nya",
        "にゅ": "nyu",
        "にょ": "nyo",

        "ひゃ": "hya",
        "ひゅ": "hyu",
        "ひょ": "hyo",

        "みゃ": "mya",
        "みゅ": "myu",
        "みょ": "myo",

        "りゃ": "rya",
        "りゅ": "ryu",
        "りょ": "ryo",

        "ぎゃ": "gya",
        "ぎゅ": "gyu",
        "ぎょ": "gyo",

        "じゃ": "ja",
        "じゅ": "ju",
        "じぇ": "je",
        "じょ": "jo",

        "びゃ": "bya",
        "びゅ": "byu",
        "びょ": "byo",

        "ぴゃ": "pya",
        "ぴゅ": "pyu",
        "ぴょ": "pyo",

        "ふぁ": "fa",
        "ふぃ": "fi",
        "ふぇ": "fe",
        "ふぉ": "fo",
        "ふゅ": "fyu",

        "うぁ": "wa",
        "うぃ": "wi",
        "うぇ": "we",
        "うぉ": "wo",

        "くぁ": "kwa",
        "くぃ": "kwi",
        "くぇ": "kwe",
        "くぉ": "kwo",

        "ぐぁ": "gwa",
        "ぐぃ": "gwi",
        "ぐぇ": "gwe",
        "ぐぉ": "gwo",

        "てぃ": "ti",
        "てゅ": "tyu",
        "でぃ": "di",
        "でゅ": "dyu",

        "とぅ": "tu",
        "どぅ": "du",

        "つぁ": "tsa",
        "つぃ": "tsi",
        "つぇ": "tse",
        "つぉ": "tso",

        "ゔぁ": "va",
        "ゔぃ": "vi",
        "ゔぇ": "ve",
        "ゔぉ": "vo",
        "ゔゅ": "vyu",

        "すぃ": "si",
        "ずぃ": "zi",

        "いぇ": "ye",
        "きぇ": "kye",
        "ぎぇ": "gye",
        "にぇ": "nye",
        "ひぇ": "hye",
        "びぇ": "bye",
        "ぴぇ": "pye",
        "みぇ": "mye",
        "りぇ": "rye"
    };

    const state = {
        enabled: true,
        stopped: false,
        typing: false,
        generation: 0,
        lastQuestion: "",
        scriptSources: [],
        observer: null,
        timer: null
    };

    const sleep = (milliseconds) => {
        return new Promise((resolve) => {
            window.setTimeout(resolve, milliseconds);
        });
    };

    function log(...values) {
        if (CONFIG.debug) {
            console.log("[自動タイピング]", ...values);
        }
    }

    function katakanaToHiragana(value) {
        return [...value].map((character) => {
            const code = character.charCodeAt(0);

            if (code >= 0x30A1 && code <= 0x30F6) {
                return String.fromCharCode(code - 0x60);
            }

            return character;
        }).join("");
    }

    function lastVowel(value) {
        const match = value.match(/[aeiou](?!.*[aeiou])/);
        return match?.[0] ?? "";
    }

    function kanaToRomaji(value) {
        const text = katakanaToHiragana(
            value.normalize("NFKC")
        );

        let result = "";
        let smallTsu = false;

        for (let index = 0; index < text.length; index += 1) {
            const character = text[index];

            if (character === "っ") {
                smallTsu = true;
                continue;
            }

            if (character === "ー") {
                result += lastVowel(result);
                continue;
            }

            if (/[\s、。・！？,.!?「」『』（）()]/u.test(character)) {
                continue;
            }

            const pair = text.slice(index, index + 2);
            let romaji = kanaMap[pair];

            if (romaji !== undefined) {
                index += 1;
            } else {
                romaji = kanaMap[character];
            }

            if (romaji === undefined) {
                return "";
            }

            if (smallTsu) {
                const consonant = romaji.match(/^[bcdfghjklmnpqrstvwxyz]/);

                if (consonant) {
                    if (romaji.startsWith("ch")) {
                        result += "t";
                    } else {
                        result += consonant[0];
                    }
                }

                smallTsu = false;
            }

            if (character === "ん") {
                const nextPair = text.slice(index + 1, index + 3);
                const nextCharacter = text[index + 1];
                const nextRomaji =
                    kanaMap[nextPair]
                    ?? kanaMap[nextCharacter]
                    ?? "";

                if (/^[aiueoyn]/.test(nextRomaji)) {
                    romaji = "nn";
                }
            }

            result += romaji;
        }

        return result.toLowerCase();
    }

    function isKanaOnly(value) {
        return /^[\u3040-\u30ffー\s・、。！？]+$/u.test(value);
    }

    function isRomaji(value) {
        return /^[a-zA-Z][a-zA-Z0-9' -]*$/u.test(value.trim());
    }

    function normalizeRomaji(value) {
        return value
            .normalize("NFKC")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9'_-]/g, "");
    }

    function decodeQuotedString(value) {
        const quote = value[0];
        let body = value.slice(1, -1);

        body = body
            .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, code) => {
                return String.fromCodePoint(
                    Number.parseInt(code, 16)
                );
            })
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => {
                return String.fromCharCode(
                    Number.parseInt(code, 16)
                );
            })
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, "\"")
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, "\\");

        if (quote === "`" && body.includes("${")) {
            return "";
        }

        return body;
    }

    function getQuestion() {
        return document
            .querySelector(CONFIG.questionSelector)
            ?.textContent
            ?.trim() ?? "";
    }

    function candidateScore(candidate, context, distance) {
        const value = candidate.trim();

        if (!value || value.length > 100) {
            return -Infinity;
        }

        let score = -distance / 20;

        if (isRomaji(value)) {
            score += 100;
        }

        if (isKanaOnly(value)) {
            score += 60;
        }

        if (
            /romaji|roman|typing|answer|input|reading|yomi|kana|ruby/i
                .test(context)
        ) {
            score += 100;
        }

        if (/word|question|text|display/i.test(context)) {
            score += 20;
        }

        if (
            /class|function|const|let|var|return|document|window|querySelector/i
                .test(value)
        ) {
            score -= 100;
        }

        return score;
    }

    function findAnswerInSources(question) {
        const candidates = [];

        for (const source of state.scriptSources) {
            let position = 0;

            while (true) {
                const foundAt = source.indexOf(question, position);

                if (foundAt === -1) {
                    break;
                }

                const start = Math.max(0, foundAt - 500);
                const end = Math.min(
                    source.length,
                    foundAt + question.length + 500
                );
                const area = source.slice(start, end);
                const quotePattern =
                    /(["'`])(?:\\.|(?!\1)[^\\\r\n])*\1/g;

                for (const match of area.matchAll(quotePattern)) {
                    const value = decodeQuotedString(match[0]).trim();

                    if (!value || value === question) {
                        continue;
                    }

                    if (!isRomaji(value) && !isKanaOnly(value)) {
                        continue;
                    }

                    const absolutePosition = start + match.index;
                    const distance = Math.abs(
                        absolutePosition - foundAt
                    );
                    const contextStart = Math.max(
                        0,
                        match.index - 60
                    );
                    const context = area.slice(
                        contextStart,
                        match.index + match[0].length + 20
                    );
                    const score = candidateScore(
                        value,
                        context,
                        distance
                    );

                    candidates.push({
                        value,
                        score
                    });
                }

                position = foundAt + question.length;
            }
        }

        candidates.sort((left, right) => {
            return right.score - left.score;
        });

        for (const candidate of candidates) {
            if (isRomaji(candidate.value)) {
                const answer = normalizeRomaji(candidate.value);

                if (answer) {
                    return answer;
                }
            }

            if (isKanaOnly(candidate.value)) {
                const answer = kanaToRomaji(candidate.value);

                if (answer) {
                    return answer;
                }
            }
        }

        return "";
    }

    function findAnswerInPage(questionElement) {
        const attributes = [
            ...questionElement.attributes
        ];

        for (const attribute of attributes) {
            if (
                /romaji|roman|answer|reading|yomi|kana/i
                    .test(attribute.name)
            ) {
                const value = attribute.value.trim();

                if (isRomaji(value)) {
                    return normalizeRomaji(value);
                }

                if (isKanaOnly(value)) {
                    return kanaToRomaji(value);
                }
            }
        }

        const nearbyElements = [
            questionElement.previousElementSibling,
            questionElement.nextElementSibling,
            questionElement.parentElement
        ].filter(Boolean);

        const selectors = [
            "[data-romaji]",
            "[data-roman]",
            "[data-answer]",
            "[data-reading]",
            "[data-yomi]",
            ".romaji",
            ".roman",
            ".reading",
            ".yomi",
            ".kana",
            "#romaji",
            "#roman-text",
            "#reading"
        ].join(",");

        for (const root of nearbyElements) {
            const elements = [
                root,
                ...root.querySelectorAll(selectors)
            ];

            for (const element of elements) {
                const values = [
                    element.dataset?.romaji,
                    element.dataset?.roman,
                    element.dataset?.answer,
                    element.dataset?.reading,
                    element.dataset?.yomi,
                    element.textContent
                ].filter(Boolean);

                for (const rawValue of values) {
                    const value = rawValue.trim();

                    if (value === getQuestion()) {
                        continue;
                    }

                    if (isRomaji(value)) {
                        return normalizeRomaji(value);
                    }

                    if (isKanaOnly(value)) {
                        return kanaToRomaji(value);
                    }
                }
            }
        }

        return "";
    }

    function resolveAnswer(question) {
        const questionElement = document.querySelector(
            CONFIG.questionSelector
        );

        if (!questionElement) {
            return "";
        }

        const pageAnswer = findAnswerInPage(questionElement);

        if (pageAnswer) {
            return pageAnswer;
        }

        const sourceAnswer = findAnswerInSources(question);

        if (sourceAnswer) {
            return sourceAnswer;
        }

        if (isKanaOnly(question)) {
            return kanaToRomaji(question);
        }

        return "";
    }

    function getKeyboardData(character) {
        if (/^[a-z]$/i.test(character)) {
            return {
                key: character,
                code: `Key${character.toUpperCase()}`,
                keyCode: character.toUpperCase().charCodeAt(0)
            };
        }

        if (/^[0-9]$/.test(character)) {
            return {
                key: character,
                code: `Digit${character}`,
                keyCode: character.charCodeAt(0)
            };
        }

        const specialKeys = {
            "-": {
                code: "Minus",
                keyCode: 189
            },
            "_": {
                code: "Minus",
                keyCode: 189
            },
            "'": {
                code: "Quote",
                keyCode: 222
            },
            " ": {
                code: "Space",
                keyCode: 32
            }
        };

        return {
            key: character,
            code: specialKeys[character]?.code ?? "",
            keyCode: specialKeys[character]?.keyCode ?? 0
        };
    }

    function createKeyboardEvent(type, character) {
        const keyboardData = getKeyboardData(character);
        const event = new KeyboardEvent(type, {
            key: keyboardData.key,
            code: keyboardData.code,
            bubbles: true,
            cancelable: true,
            composed: true
        });

        try {
            Object.defineProperty(event, "keyCode", {
                configurable: true,
                get: () => keyboardData.keyCode
            });

            Object.defineProperty(event, "which", {
                configurable: true,
                get: () => keyboardData.keyCode
            });

            Object.defineProperty(event, "charCode", {
                configurable: true,
                get: () => (
                    type === "keypress"
                        ? keyboardData.keyCode
                        : 0
                )
            });
        } catch {
            // プロパティを変更できないブラウザでは何もしない
        }

        return event;
    }

    function sendKey(character) {
        const target =
            document.activeElement
            && document.activeElement !== document.documentElement
                ? document.activeElement
                : document.body;

        target.dispatchEvent(
            createKeyboardEvent("keydown", character)
        );
        target.dispatchEvent(
            createKeyboardEvent("keypress", character)
        );
        target.dispatchEvent(
            createKeyboardEvent("keyup", character)
        );
    }

    async function typeQuestion() {
        if (
            state.stopped
            || !state.enabled
            || state.typing
        ) {
            return;
        }

        const question = getQuestion();

        if (!question || question === state.lastQuestion) {
            return;
        }

        const answer = resolveAnswer(question);

        if (!answer) {
            state.lastQuestion = question;
            console.warn(
                `[自動タイピング] 読み方を取得できません: ${question}`
            );
            return;
        }

        state.typing = true;
        state.lastQuestion = question;

        const localGeneration = ++state.generation;

        log(`${question} → ${answer}`);

        await sleep(CONFIG.initialDelay);

        for (const character of answer) {
            if (
                state.stopped
                || !state.enabled
                || localGeneration !== state.generation
                || getQuestion() !== question
            ) {
                break;
            }

            sendKey(character);

            const delay =
                CONFIG.keyDelay
                + Math.floor(
                    Math.random() * (CONFIG.randomDelay + 1)
                );

            await sleep(delay);
        }

        state.typing = false;

        state.timer = window.setTimeout(() => {
            if (getQuestion() !== question) {
                typeQuestion();
            }
        }, CONFIG.nextQuestionDelay);
    }

    async function loadScriptSources() {
        const scripts = [...document.scripts];

        for (const script of scripts) {
            if (script.textContent?.trim()) {
                state.scriptSources.push(script.textContent);
            }

            if (!script.src) {
                continue;
            }

            try {
                const response = await fetch(script.src, {
                    credentials: "same-origin",
                    cache: "no-store"
                });

                if (response.ok) {
                    state.scriptSources.push(
                        await response.text()
                    );
                }
            } catch (error) {
                log(
                    "JavaScriptの読み込みをスキップしました",
                    error
                );
            }
        }

        log(
            `${state.scriptSources.length}個のスクリプトを解析しました`
        );
    }

    function handleToggle(event) {
        if (
            event.key !== CONFIG.toggleKey
            || event.repeat
            || state.stopped
        ) {
            return;
        }

        event.preventDefault();

        state.enabled = !state.enabled;
        state.typing = false;
        state.generation += 1;
        state.lastQuestion = "";

        console.log(
            `[自動タイピング] ${
                state.enabled ? "ON" : "OFF"
            }`
        );

        if (state.enabled) {
            typeQuestion();
        }
    }

    function stop() {
        state.stopped = true;
        state.enabled = false;
        state.typing = false;
        state.generation += 1;

        if (state.timer) {
            window.clearTimeout(state.timer);
        }

        state.observer?.disconnect();

        window.removeEventListener(
            "keydown",
            handleToggle,
            true
        );

        console.log("[自動タイピング] 停止しました");
    }

    window.__autoJapaneseTyper = {
        stop,
        start() {
            state.enabled = true;
            state.lastQuestion = "";
            typeQuestion();
        }
    };

    await loadScriptSources();

    state.observer = new MutationObserver(() => {
        const question = getQuestion();

        if (
            state.typing
            && question !== state.lastQuestion
        ) {
            state.generation += 1;
            state.typing = false;
        }

        if (
            state.enabled
            && question
            && question !== state.lastQuestion
        ) {
            typeQuestion();
        }
    });

    state.observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
    });

    window.addEventListener(
        "keydown",
        handleToggle,
        true
    );

    console.log(
        `[自動タイピング] ON・${CONFIG.toggleKey}で切り替え`
    );

    typeQuestion();
})();
