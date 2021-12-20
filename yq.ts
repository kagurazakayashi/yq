/**
 * 雅詩TS工具類
 * by 神楽坂雅詩
 */

// 包含尺寸和位置的結構體
export interface YQRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
// 包含顏色數值的結構體
export interface YQColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

// YQ
export default class YQ {
    static yqStr = 'YQ';

    /**
     * 獲取 HTML DOM 物件
     * @param {string} element 物件描述（'div','.divclass','#divid','[value]'）
     * @param {HTMLElement} parentDOM 要從哪個元素中獲取
     * @return {HTMLElement|HTMLElement[]|null} HTML 物件/物件組/空
     */
    static dom(element: string, parentDOM = document.body): HTMLElement | HTMLElement[] | null {
        if (element.length == 0) {
            return null;
        }
        const mode: string = element.substr(0, 1);
        if (mode == '.') {
            element = element.substr(1);
            if (element.length == 0) {
                return null;
            }
            const elements: HTMLCollectionOf<Element> = parentDOM.getElementsByClassName(element);
            if (elements.length == 0) {
                return null;
            }
            return Array.prototype.slice.call(elements);
        } else if (mode == '#') {
            element = element.substr(1);
            if (element.length == 0) {
                return null;
            }
            return document.getElementById(element);
        } else if (mode == '[') {
            element = element.substr(1, element.length - 2);
            if (element.length == 0) {
                return null;
            }
            const elements: HTMLElement[] = YQ.getHasAttribute(element, parentDOM);
            if (elements.length == 0) {
                return null;
            }
            return elements;
        } else if ((mode >= 'a' && mode <= 'z') || (mode >= 'A' && mode <= 'Z')) {
            const elements: HTMLCollectionOf<Element> = document.getElementsByTagName(element);
            if (elements.length == 0) {
                return null;
            }
            return Array.prototype.slice.call(elements);
        }
        return null;
    }

    /**
     * 快捷通过 id 获取取 div（假设该 id 一定存在）
     * @param {string} element div 的 id
     * @return {HTMLDivElement} div 物件
     */
    static divById(element: string): HTMLDivElement {
        const divdom: HTMLElement | null = document.getElementById(element);
        if (!divdom) {
            YQ.log(element + ' Not Found', YQ.yqStr, -2);
            return document.createElement('div');
        }
        return document.getElementById(element) as HTMLDivElement;
    }

    /**
     * 傳送 GET 請求
     * @param {string}   url      請求網址
     * @param {unknown}   data     需要提交的資料
     * @param {function} callback 回撥函式
     * @param {boolean}  async    是否使用非同步請求
     */
    static get<T extends unknown>(url: string, data?: T, callback?: (data: XMLHttpRequest | null, status: number) => void, async = true): void {
        YQ.ajax('GET', url, data, callback, async);
    }
    /**
     * 傳送 POST 請求
     * @param {string}   url      請求網址
     * @param {unknown}   data     需要提交的資料
     * @param {function} callback 回撥函式
     * @param {boolean}  async    是否使用非同步請求
     */
    static post<T extends unknown>(url: string, data?: T, callback?: (data: XMLHttpRequest | null, status: number) => void, async = true): void {
        YQ.ajax('POST', url, data, callback, async);
    }
    /**
     * 傳送請求
     * @param {string}   type     請求方式
     * @param {string}   url      請求網址
     * @param {unknown}   data     需要提交的資料
     * @param {function} callback 回撥函式
     * @param {boolean}  async    是否使用非同步請求
     */
    static ajax<T extends unknown>(type: string, url: string, data?: T, callback?: (data: XMLHttpRequest | null, status: number) => void, async = true): void {
        if (url.length == 0) {
            return;
        }
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        const dataArr: string[] = [];
        if (data) {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    dataArr.push(key + '=' + element);
                }
            }
        }
        const isArg = dataArr.length > 0;
        const dataStr = isArg ? dataArr.join('&') : '';
        // YQ.log(`请求网址 ${url} , 数据 ${dataStr}`, YQ.yqStr);
        const isGET = type == 'GET';
        if (isGET && isArg) {
            url += '?' + dataStr;
        }
        xhr.open(type, url, async);
        xhr.onload = function () {
            // YQ.log(`请求网址 ${url} 成功，返回数据 ${this.responseText}`, YQ.yqStr);
            if (callback) {
                callback(this, this.status);
            }
        };
        xhr.onerror = function () {
            // YQ.log(`请求网址 ${url} 失败，返回状态码 ${this.status}`, YQ.yqStr, -2);
            if (callback) {
                callback(null, this.status);
            }
        };
        if (isGET) {
            xhr.send();
        } else {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            if (isArg) {
                xhr.send(dataStr);
            } else {
                xhr.send();
            }
        }
    }

    /**
     * 輸出日誌
     * @param {any}    info   要輸出的物件
     * @param {string} module 模組
     * @param {object} level  警告等級 0普通 -1警告 -2錯誤
     */
    static log(info: unknown, module = '', level = 0): void {
        const date: Date = new Date();
        const dateStr = date.toLocaleTimeString();
        if (module.length > 0) {
            module = '[' + module + ']';
        }
        module = '[' + dateStr + ']' + module;
        if (level == 0) {
            console.log(module, info);
        } else if (level == -1) {
            console.warn(module, info);
        } else if (level == -2) {
            console.error(module, info);
        }
    }

    /**
     * 逐漸顯示
     * @param {HTMLElement} obj      要操作的 DOM 物件
     * @param {number}      speed    動畫速度(毫秒)
     * @param {function}    callback 動畫完成之後的回撥
     */
    static fadeIn(obj: HTMLElement, speed = 1, callback?: () => void): void {
        obj.style.transition = '';
        obj.style.opacity = '0';
        obj.style.transition = 'opacity ' + speed.toString() + 'ms';
        YQ.animateCallback(obj, true, callback);
        obj.style.opacity = '1';
    }
    /**
     * 逐漸隱藏
     * @param {HTMLElement} obj      要操作的 DOM 物件
     * @param {number}      speed    動畫速度(毫秒)
     * @param {function}    callback 動畫完成之後的回撥
     */
    static fadeOut(obj: HTMLElement, speed: number = 1000, callback?: (obj?: HTMLElement) => void): void {
        obj.style.transition = '';
        obj.style.opacity = '1';
        obj.style.transition = 'opacity ' + speed.toString() + 'ms';
        YQ.animateCallback(obj, true, callback);
        obj.style.opacity = '0';
    }

    /**
     * 執行自定義動畫
     * 不建議連續執行。連續執行不會產生動畫序列。
     * @param {HTMLElement} obj 要操作的 DOM 物件
     * @param {object} params （字典）要執行哪些動畫
     * key 和 val 和 CSS 對應。（示例見 README.md ）
     * @param {number} speed 需要用多長時間來播放這個動畫（毫秒）
     * @param {Function} callback 動畫完成後的回撥
     * @param {boolean} rmTransition 動畫完成後移除該物件 CSS 的 transition 樣式
     */
    static animate(obj: HTMLElement, params: object, speed: number = 1000, callback?: (obj?: HTMLElement) => void, rmTransition: boolean = true): void {
        const paramsObj: any = params;
        obj.style.transition = 'all ' + speed.toString() + 'ms';
        YQ.animateCallback(obj, rmTransition, callback);
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const val: string = paramsObj[key] as string;
                eval(`obj.style.${key}='${val}';`);
            }
        }
    }

    /**
     * 執行自定義動畫序列
     * @param {Array} list 動畫序列二維陣列
     * 每個設定物件包括 [網頁元素,動畫字典,動畫時長] （示例見 README.md ）
     * @param {Function} callback 動畫完成之後的回撥
     * @param {Function} step 每個步驟動畫完成之後的回撥
     */
    static animateList(list: (number | HTMLElement | {})[][], callback?: () => void, step?: (obj?: HTMLElement, stepi?: number, total?: number) => void): void {
        const stepi = 0;
        const total = list.length;
        const listFunc = (aniConf: object[]) => {
            const obj: HTMLElement = aniConf[0] as HTMLElement;
            const params: object = aniConf[1];
            const speed: number = aniConf[2] as unknown as number;
            const stepCallback = () => {
                list.shift();
                if (step) {
                    step(obj, stepi, total);
                }
                if (list.length > 0) {
                    listFunc(list[0] as object[]);
                } else if (callback) {
                    callback();
                }
            };
            const rmTransition: boolean = (list.length == 1);
            YQ.animate(obj, params, speed, stepCallback, rmTransition);
        };
        listFunc(list[0] as object[]);
    }

    /**
     * 通用動畫回撥，無需外部呼叫
     * @param {HTMLElement} obj 要操作的 DOM 物件
     * @param {boolean} rmTransition 動畫完成後移除該物件 CSS 的 transition 樣式
     * @param {callback} callback 動畫完成之後的回撥
     */
    static animateCallback(obj: HTMLElement, rmTransition: boolean = true, callback?: (obj?: HTMLElement) => void): void {
        const cssAniListen: string = 'Transitionend'; // Animationend
        const listenPfx = ['webkit', 'moz', 'MS', 'o', ''];
        for (let i = 0; i < listenPfx.length; i++) {
            const pfx = listenPfx[i];
            listenPfx[i] = (pfx.length == 0) ? cssAniListen.toLowerCase() : pfx + cssAniListen;
        }
        if (callback) {
            const animationend = () => {
                callback(obj);
                for (const listen of listenPfx) {
                    obj.removeEventListener(listen, animationend);
                }
                if (rmTransition) {
                    obj.style.transition = '';
                }
            };
            for (const listen of listenPfx) {
                obj.addEventListener(listen, animationend, false);
            }
        }
    }

    /**
     * 立即顯示
     * @param {HTMLElement} obj 要操作的 DOM 物件
     */
    static show(obj: HTMLElement): void {
        const displayName: string = 'y-display';
        const nowDisplay: string = obj.style.display;
        if (nowDisplay.length > 0 && nowDisplay != 'none') {
            return;
        }
        const newStyle = obj.hasAttribute(displayName) ? obj.getAttribute(displayName) as string : 'block';
        obj.removeAttribute(displayName);
        if (nowDisplay != newStyle) {
            obj.style.display = newStyle;
        }
    }
    /**
     * 立即隱藏
     * @param {HTMLElement} obj 要操作的 DOM 物件
     */
    static hide(obj: HTMLElement): void {
        const displayName: string = 'y-display';
        const nowDisplay: string = obj.style.display;
        const none: string = 'none';
        if (nowDisplay.length > 0 && nowDisplay != none) {
            obj.setAttribute(displayName, nowDisplay);
        }
        const newStyle: string = none;
        if (nowDisplay != newStyle) {
            obj.style.display = newStyle;
        }
    }
    /**
     * 如果已顯示則隱藏，如果已隱藏則顯示
     * @param {HTMLElement} obj 要操作的 DOM 物件
     * @return {boolean} 現在應該是顯示還是隱藏的
     */
    static autoShowHide(obj: HTMLElement): boolean {
        const nowDisplay: string = obj.style.display;
        const isShow: boolean = (nowDisplay.length > 0 && nowDisplay != 'none');
        if (isShow) {
            YQ.hide(obj);
        } else {
            YQ.show(obj);
        }
        return !isShow;
    }

    /**
     * 遍歷 DOM 物件
     * @param {string} selector 要操作的 DOM 物件描述
     * @param {function} callback 處理遍歷物件的函式
     */
    static each(selector: string, callback: (el: unknown, i: number) => void): void {
        const elements: NodeListOf<Element> = document.querySelectorAll(selector);
        Array.prototype.forEach.call(elements, callback);
    }

    /**
     * 獲得網址中 # 後面的引數
     * @param {string} getKey 獲取指定的鍵（返回 string），若不提供此值，則返回鍵值陣列（string[][]）
     * @return {string[]|string} 取得的鍵值或值
     */
    static argv(getKey?: string): string[][] | string {
        const argvs: string[][] = [];
        const argStr: string = window.location.hash;
        if (argStr.length <= 1) {
            return argvs;
        }
        const argArr: string[] = argStr.substring(1).split('&');
        for (const key in argArr) {
            if (Object.prototype.hasOwnProperty.call(argArr, key)) {
                const nowArg: string = argArr[key];
                const nowArr: string[] = nowArg.split('=');
                const nowKey: string = nowArr[0];
                let nowVal = '';
                if (nowArr.length > 0) {
                    nowVal = nowArr[1];
                }
                if (getKey && getKey == nowKey) {
                    return nowVal;
                } else {
                    argvs.push([nowKey, nowVal]);
                }
            }
        }
        if (getKey) {
            return '';
        }
        return argvs;
    }

    /**
     * 將 HTML 字串轉換為 DOM
     * @param {string} dom DOM 字串
     * @return {NodeListOf<ChildNode>} DOM
     */
    static stringToDOM(dom: string): NodeListOf<ChildNode> {
        const saveElement: HTMLDivElement = document.createElement('div');
        saveElement.innerHTML = dom;
        return saveElement.childNodes;
    }
    /**
     * 將 DOM 轉換為 HTML 字串
     * @param {NodeListOf<ChildNode>} node DOM
     * @return {string} HTML 字串
     */
    static domToString(node: globalThis.Node): string {
        const saveElement: HTMLDivElement = document.createElement('div');
        saveElement.appendChild(node);
        return saveElement.innerHTML;
    }

    /**
     * 獲取兩字串之間的內容
     * @param {string} strSource 原始字串
     * @param {string} strStart 起始字串
     * @param {string} strEnd 結束字串
     * @return {string} 兩字串之間的內容
     */
    static stringNode(strSource: string, strStart: string, strEnd: string): string {
        const startIndex: number = strSource.indexOf(strStart) + strStart.length;
        if (startIndex < 0) {
            return strSource;
        }
        const noStartText = strSource.substring(startIndex);
        const endIndex: number = noStartText.indexOf(strEnd);
        if (endIndex < 0) {
            return strSource;
        }
        return noStartText.substring(0, endIndex);
    }

    /**
     * 取兩個字元之間的內容，這兩個字元有層級配對的關係
     * 例如： xx{a{}b{}}yy 會取出 a{}b{}
     * @param {string} str 要處理的字串
     * @param {string} startChar 開始字元（不要輸入字串）
     * @param {string} endChar 結束字元（不要輸入字串）
     * @return {string} 取出的字串
    */
    static substrPair(str: string, startChar = '{', endChar = '}'): string {
        if (str.length < 3) {
            return '';
        }
        let lc: number = -1;
        let start: number = -1;
        let sLen: number = 0;
        for (let i = 0; i < str.length; i++) {
            const char: string = str.charAt(i);
            if (lc > 0) {
                sLen++;
            }
            if (char == startChar) {
                if (lc < 0) {
                    lc = 0;
                }
                lc++;
                if (start < 0) {
                    start = i;
                }
            } else if (char == endChar) {
                lc--;
            }
            if (lc == 0) {
                return str.substr(start + 1, sLen - 1);
            }
        }
        return '';
    }

    /**
     * 替換字串中的所有指定字串
     * @param {string} str 要處理的字串
     * @param {string} searchValue 要查詢的字串
     * @param {string} replaceValue 要替換成的字串
     * @return {string} 修改後的字串
     */
    static replaceAll(str: string, searchValue: string, replaceValue: string): string {
        if (str.length == 0) {
            return '';
        }
        const sa: string[] = str.split(searchValue);
        if (sa.length <= 1) {
            return str;
        }
        return sa.join(replaceValue);
    }

    /**
     * 讀入模板網頁
     * @param {string} templateFileCode 模板檔案內容（示例见 README.md ）
     * @param {string} templateID 取出模板檔案中的哪個模板ID
     * @param {string} replaceList [["把哪塊","裡的內容替換成什麼"]]，塊名不能重複
     * @param {boolean} replaceAll 是否全部替換（僅在模板裡有同名變數時開啟以免浪費效能）
     * @return {string} 從模板生成的 HTML
     */
    static loadTemplateHtml(templateFileCode: string, templateID: string = '', replaceList: string[][] = [], replaceAll: boolean = false): string {
        let fStart = '';
        const template: string = 'template';
        const fEnd = '</' + template + '>';
        if (templateID.length == 0) {
            fStart = '<' + template + '>';
        } else {
            fStart = '<' + template + ' id="' + templateID + '">';
        }
        let templateHTML = YQ.stringNode(templateFileCode, fStart, fEnd);
        for (const replaceKV of replaceList) {
            const replaceK: string = '{{ ' + replaceKV[0] + ' }}';
            const replaceV: string = replaceKV[1];
            templateHTML = replaceAll ? YQ.replaceAll(templateHTML, replaceK, replaceV) : templateHTML.replace(replaceK, replaceV);
        }
        return templateHTML;
    }

    /**
     * 讀入模板 CSS 樣式
     * @param {string} templateFileCode 模板檔案內容（示例见 README.md ）
     * @param {string} templateID 取出模板檔案中的哪個模板ID
     * @param {string} replaceList [["把哪塊","裡的內容替換成什麼"]]，塊名不能重複
     * @param {boolean} replaceAll 是否全部替換（僅在模板裡有同名變數時開啟以免浪費效能）
     * @return {string} 從模板生成的 HTML
     */
    static loadTemplateCss(templateFileCode: string, templateID: string = '', replaceList: string[][] = [], replaceAll: boolean = false): string {
        const tempName = '@-template-' + templateID;
        const fStart: number = templateFileCode.indexOf(tempName);
        if (fStart == -1) {
            return '';
        }
        let tempCSS = templateFileCode.substring(fStart);
        tempCSS = YQ.substrPair(tempCSS);
        if (tempCSS.length == 0) {
            return '';
        }
        for (const replaceKV of replaceList) {
            const replaceK: string = '{{ ' + replaceKV[0] + ' }}';
            const replaceV: string = replaceKV[1];
            tempCSS = replaceAll ? YQ.replaceAll(tempCSS, replaceK, replaceV) : tempCSS.replace(replaceK, replaceV);
        }
        return tempCSS;
    }

    /**
     * 粗略時間差描述文字
     * @param {number} time 時間戳（預設用秒級）
     * @param {number[]} timeArr 自定義時間分隔
     * @param {string[]} timeUnitStr 自定義時間分隔文字（s結尾複數需要帶上s，輸出時會自動增減）
     * @return {string} 描述文字
     */
    static timeDiffStr(time: number, timeArr: number[] = [525600, 262080, 43200, 1440, 60, 1, 0], timeUnitStr: string[] = ['年', '半年', '月', '日', '小时', '分钟', '刚刚', '前']): string {
        let tTime = 0;
        let tStr = '';
        for (let i = 0; i < timeArr.length; i++) {
            if (time > timeArr[i]) {
                tTime = time / timeArr[i];
                tStr = timeUnitStr[i];
                break;
            }
        }
        if (tTime == Infinity) {
            tTime = 0;
        } else {
            tTime = Math.floor(tTime);
        }
        if (tTime == 1 && tStr && tStr.length > 0 && tStr.substr(tStr.length - 1) == 's') {
            tStr = tStr.substr(0, tStr.length - 1);
        }
        if (tTime == 0) {
            return timeUnitStr[timeUnitStr.length - 2];
        }
        return tTime.toString() + ' ' + tStr + timeUnitStr[timeUnitStr.length - 1];
    }

    /**
     * 從物件中查詢屬性並返回，並確定每個屬性是否存在，否則提供預設值
     * @param {unknown} obj 要從哪個元素查詢
     * @param {string} property 屬性路徑 'obj1.obj2.obj3'
     * @param {unknown} defaultVal 沒有找到時返回的預設值
     * @param {boolean} showWarn 是否在瀏覽器控制檯顯示找不到物件的資訊
     * @return {boolean} isok 是否有擁有此屬性
     * @return {string} path 物件路徑
     * @return {string} type 物件型別
     * @return {unknown} obj 找到的屬性物件或預設值
    */
    static getProperty(obj: unknown, property: string, defaultVal: unknown = null, showWarn = false): {
        isok: boolean;
        path: string;
        type: string;
        obj: unknown;
    } {
        const propertys: string[] = property.split('.');
        let path = 'obj';
        let type = 'undefined';
        for (const prop of propertys) {
            path = path + '.' + prop;
            type = typeof eval(path);
            if (type == 'undefined') {
                if (showWarn) {
                    console.warn('Cannot read property "' + path + '"');
                }
                return {
                    isok: false,
                    path: path,
                    type: type,
                    obj: defaultVal,
                };
            }
        }
        const isOK = type != 'undefined';
        const rObj = eval(path);
        return {
            isok: isOK,
            path: path,
            type: type,
            obj: rObj,
        };
    }

    /**
     * 從物件中查詢屬性並返回，並確定每個屬性是否存在，否則提供預設值（只返回精簡資訊）
     * @param {unknown} obj 要從哪個元素查詢
     * @param {string} property 屬性路徑 obj1.obj2.obj3
     * @param {unknown} defaultVal 沒有找到時返回的預設值
     * @param {boolean} showWarn 是否在瀏覽器控制檯顯示找不到物件的資訊
     * @return {any} 找到的屬性物件或預設值
    */
    static getProp(obj: unknown, property: string, defaultVal: unknown = null, showWarn = true): unknown {
        const prop: { isok: boolean; path: string; type: string; obj: unknown; } = YQ.getProperty(obj, property, defaultVal, showWarn);
        return prop.obj;
    }

    /**
     * 檢查數值是否在區間中
     * @param {string | number[]} scope
     * string:   區間描述文字，如 "(0,10)"
     *     "(,100]"  : ∞ < x ≤ 100
     *     "[0,100)" : 0 ≤ x < 100
     * number[]: 區間數字陣列 [最小值,最大值]
     * @param {number} value 要被測量的數字
     * @param {boolean} isNewNum 返回符合範圍的 ±1 數字 (value 必須輸入整數)
     * @return {number} isNewNum ? 符合範圍的 ±1 數字 : (-1小於 0正常 1大於)
     */
    static scopeCalc(scope: string | number[], value: number, isNewNum = false): number {
        const isNumArr = scope instanceof Array;
        const incStart: boolean = isNumArr ? true : ((scope as string).substring(0, 1) == '[');
        const incEnd: boolean = isNumArr ? true : ((scope as string).substring(scope.length - 1) == ']');
        const scopeArr: string[] = isNumArr ? [] : (scope as string).substring(1, scope.length - 1).split(',');
        if (isNumArr || scopeArr[0].length > 0) {
            const minVal: number = isNumArr ? (scope as number[])[0] : parseFloat(scopeArr[0]);
            if (incStart) {
                if (value < minVal) {
                    // YQ.log(`数值 ${value} 小于等于 标准值 ${scope} 中的 ${minVal}`, YQ.yqStr);
                    return isNewNum ? minVal : -1;
                }
            } else {
                if (value <= minVal) {
                    // YQ.log(`数值 ${value} 小于 标准值 ${scope} 中的 ${minVal}`, YQ.yqStr);
                    return isNewNum ? minVal + 1 : -1;
                }
            }
        }
        if (isNumArr || scopeArr[1].length > 0) {
            const maxVal: number = isNumArr ? (scope as number[])[1] : parseFloat(scopeArr[1]);
            if (incEnd) {
                if (value > maxVal) {
                    // YQ.log(`数值 ${value} 大于等于 标准值 ${scope} 中的 ${maxVal}`, YQ.yqStr);
                    return isNewNum ? maxVal : 1;
                }
            } else {
                if (value >= maxVal) {
                    // YQ.log(`数值 ${value} 大于 标准值 ${scope} 中的 ${maxVal}`, YQ.yqStr);
                    return isNewNum ? maxVal - 1 : 1;
                }
            }
        }
        // YQ.log(`数值 ${value} 在此区间 ${scope}`, YQ.yqStr);
        return isNewNum ? value : 0;
    }

    /**
     * 物件的長度
     * @param {object} obj 要檢查的物件 [] 或 {}
     * @return {number} 物件的長度
    */
    static count(obj: object): number {
        const objKeys: Array<any> = Object.keys(obj);
        // YQ.log('对象列表：', YQ.yqStr);
        // console.log(YQ.yqStr, objKeys);
        return objKeys.length;
    }
    /**
     * 從物件陣列中移除所有長度為 0 的物件 {}
     * @param {object[]} obj 要檢查的物件陣列
     * @return {object[]} 清理後的物件陣列
    */
    static clearEmpty(obj: object[]): object[] {
        const newObj: object[] = [];
        for (const nowObj of obj) {
            if (nowObj && YQ.count(nowObj) > 0) {
                newObj.push(nowObj);
            }
        }
        return newObj;
    }

    /**
     * 取出指定 DOM 元素中的所有子元素
     * @param {HTMLElement} parentDOM 要檢查的元素
     * @param {boolean} structure 子元素陣列是否需要具有層次結構
     * @return {HTMLElement[]} 子元素陣列（不帶有層次結構，一維）
     * {HTMLElement[][]} 子元素多維陣列（帶有層次結構，不定維度）
    */
    static getChildrens(parentDOM = document.body, structure = false): HTMLElement[] | HTMLElement[][] {
        const clilds: HTMLElement[] = [];
        const getChildrenFunc = (parent: HTMLElement, struct: boolean): HTMLElement[][] => {
            const childDoms: HTMLElement[] | HTMLElement[][] | HTMLElement[][][] = [];
            if (struct) {
                (childDoms as HTMLElement[]).push(parent);
            } else {
                clilds.push(parent);
            }
            if (parent.children.length > 0) {
                const children: HTMLCollection = parent.children;
                const childrenLen: number = children.length;
                for (let i = 0; i < childrenLen; i++) {
                    const childrenElement: HTMLElement = children[i] as HTMLElement;
                    const nowChildrens: HTMLElement[][] = getChildrenFunc(childrenElement, struct);
                    if (struct) (childDoms as HTMLElement[][][]).push(nowChildrens);
                }
            }
            return childDoms as HTMLElement[][];
        };
        if (structure) {
            return getChildrenFunc(parentDOM, structure);
        } else {
            getChildrenFunc(parentDOM, structure);
            return clilds;
        }
    }
    /**
     * 取出指定 DOM 元素中的所有包含指定屬性的元素
     * @param {boolean} attributeName 需要包含的屬性
     * @param {HTMLElement} parentDOM 要檢查的元素
     * @return {HTMLElement[]} 包含該屬性的元素列表
    */
    static getHasAttribute(attributeName: string, parentDOM = document.body): HTMLElement[] {
        const childrens: HTMLElement[] = YQ.getChildrens(parentDOM, false) as HTMLElement[];
        const childOK: HTMLElement[] = [];
        for (const children of childrens) {
            if (children.hasAttribute(attributeName)) {
                childOK.push(children);
            }
        }
        return childOK;
    }

    /**
     * 多語言：根據 HTML 元素中的 y-lang 屬性將語言文字呈現到該元素，應在 DOM 載入完成後使用。
     * 例如： <div y-lang="zh::正在加载::en::Loading"></div>
     * @param {string} language 語言名稱
     * @param {boolean} removeAttr 操作完成後移除屬性
     * @param {HTMLElement} parentDOM 只處理此指定元素中的內容
     * @return {number} 已處理的元素數量
    */
    static yLang(language: string, removeAttr = true, parentDOM = document.body): number {
        const attrName = 'y-lang';
        let ii = 0;
        const allAttr: HTMLElement[] = YQ.getHasAttribute(attrName, parentDOM);
        for (const nowDom of allAttr) {
            const attrInfo: string | null = nowDom.getAttribute(attrName);
            if (attrInfo == null || attrInfo.length == 0) {
                continue;
            }
            const langInfos: string[] = attrInfo.split('::');
            let langKey = '';
            let langVal = '';
            for (let i = 0; i < langInfos.length; i++) {
                if (i % 2 == 0) {
                    langKey = langInfos[i];
                } else {
                    langVal = langInfos[i];
                    // 填充語言文字
                    if (langKey == language) {
                        if (nowDom.innerText != langVal) {
                            nowDom.innerText = langVal;
                        }
                        if (removeAttr) {
                            nowDom.removeAttribute(attrName);
                        }
                        ii++;
                        break;
                    }
                }
            }
        }
        return ii;
    }

    /**
     * 根據 HTML 元素中的 y-if 或 y-show 屬性中的程式碼決定該元素是否應該存在或顯示，應在 DOM 載入完成後使用。
     *   y-if 或 y-show 中的程式碼必須能夠得出一個布林值，並且只能使用全域性和 vars 輸入的變數
     *   例如： <div y-if="vars[0] == 233"></div>
     * @param {HTMLElement} parentDOM 只處理此指定元素中的內容
     * @param {boolean} showMode 只控制該物件是否顯示，否則條件不成立時該物件會被徹底移除
     * @param {any[]} 傳入任意變數，供 y-if 屬性中的程式碼使用
     * @return {number} 已處理的元素數量
    */
    static yIfShow(parentDOM = document.body, ...vars: any[]): number {
        let ii = 0;
        const attrNameArr = ['y-if', 'y-show'];
        for (let i = 0; i < 2; i++) {
            const attrName = attrNameArr[i];
            const allAttr: HTMLElement[] = YQ.getHasAttribute(attrName, parentDOM);
            for (const nowDom of allAttr) {
                const attrInfo: string | null = nowDom.getAttribute(attrName);
                if (attrInfo == null || attrInfo.length == 0) {
                    continue;
                }
                const isOK: boolean = eval(attrInfo);
                // YQ.log(`${attrName} 执行 ${attrInfo} 结果为 ${isOK}`, YQ.yqStr);
                if (i == 1) {
                    if (isOK) {
                        YQ.show(nowDom);
                    } else {
                        YQ.hide(nowDom);
                    }
                } else if (!isOK) {
                    nowDom.remove();
                }
                ii++;
            }
        }
        return ii;
    }

    /**
     * @param {string} hex 16進位制顏色，輸入包括'#'，支援 #RGB, #RRGGBB(推薦), #RRGGBBAA
     * @return {YQColor} 10進位制顏色 RGB / RGBA （沒有 alpha 通道時 alpha 為 -1）
     */
    static colorHex2Int(hex: string): YQColor {
        const rgbaInt: number[] = [0, 0, 0, -1];
        const cLen = hex.length;
        const s0x = '0x';
        if (cLen == 4 || cLen == 6) {
            for (let i = 0; i < 3; i++) {
                rgbaInt[i] = parseInt(s0x + hex.substr(i + 1, 1));
            }
            if (cLen == 6) {
                rgbaInt[3] = parseInt(s0x + hex.substr(4, 1));
            }
        } else if (cLen == 7 || cLen == 9) {
            let j: number = 1;
            for (let i = 0; i < 3; i++) {
                rgbaInt[i] = parseInt(s0x + hex.substr(j, 2));
                j += 2;
            }
            if (cLen == 9) {
                rgbaInt[3] = parseInt(s0x + hex.substr(j, 2));
            }
        }
        return {
            red: rgbaInt[0],
            green: rgbaInt[1],
            blue: rgbaInt[2],
            alpha: rgbaInt[3],
        }
    }

    /**
     * 調整顏色亮度
     * @param {string} hex 16進位制顏色，输入包括'#'，支援 #RGB, #RRGGBB(推薦), #RRGGBBAA
     * @param {number} light 亮度調節(正負數字)
     * @param {boolean} holdColor 保持RGB比例
     * @return {string} 修改後的16進位制顏色
     */
    static colorLight(hex: string, light: number = 20, holdColor = false): string {
        if (!hex) {
            return '';
        }
        const rgbaHex: string[] = ['', '', ''];
        const rgbaColor: YQColor = YQ.colorHex2Int(hex);
        const rgbaInt: number[] = [rgbaColor.red, rgbaColor.green, rgbaColor.blue];
        if (rgbaColor.alpha >= 0) {
            rgbaInt.push(rgbaColor.alpha);
        }
        const rgbaIntLen: number = rgbaInt.length;
        if (holdColor) {
            forI:
            for (let i = 0; i < Math.abs(light); i++) {
                for (let j = 0; j < 3; j++) {
                    const nextC: number = rgbaInt[j] + 1;
                    if (nextC < 0 || nextC > 255) {
                        break forI;
                    }
                }
                for (let j = 0; j < 3; j++) {
                    rgbaInt[j]++;
                }
            }
        } else {
            for (let i = 0; i < 3; i++) {
                let cInt: number = rgbaInt[i] + light;
                if (cInt > 255) {
                    cInt = 255;
                } else if (cInt < 0) {
                    cInt = 0;
                }
                rgbaInt[i] = cInt;
            }
        }
        for (let i = 0; i < rgbaIntLen; i++) {
            if (rgbaInt[i] > 0) {
                rgbaHex[i] = rgbaInt[i].toString(16);
            }
            const chHex: string = rgbaHex[i];
            if (chHex.length == 1) {
                rgbaHex[i] = '0' + chHex;
            }
        }
        return '#' + rgbaHex.join('');
    }

    /**
     * 計算元素铺满（填充）某个容器所需的位置和尺寸（內容鋪滿螢幕，多出的邊被裁去）
     * @param {number} width 元素的寬度
     * @param {number} height 元素的高度
     * @param {number} boxWidth 容器的寬度
     * @param {number} boxHeight 容器的高度
     * @return {YQRect} 需要將元素設定為此位置和尺寸
     */
    static sizeFill(width: number, height: number, boxWidth = document.body.clientWidth, boxHeight = document.body.clientHeight): YQRect {
        let x = 0;
        let y = 0;
        let w = 0;
        let h = 0;
        const wh = width / height;
        const cw = boxWidth - width;
        const ch = boxHeight - height;
        const cwh = cw / ch;
        if (cw > ch) {
            w = boxWidth;
            h = w / wh;
            y = (boxHeight - h) / 2;
        } else {
            h = boxHeight;
            w = h * wh;
            x = (boxWidth - w) / 2;
        }
        if (wh > 1) {
            if (cwh > 1.01 && cwh < wh) {
                if (cw < ch) {
                    w = boxWidth;
                    h = w / wh;
                    y = (boxHeight - h) / 2;
                    x = 0;
                } else {
                    h = boxHeight;
                    w = h * wh;
                    x = (boxWidth - w) / 2;
                    y = 0;
                }
            }
        } else {
            if (cwh > wh && cwh < 1) {
                if (cw < ch) {
                    w = boxWidth;
                    h = w / wh;
                    y = (boxHeight - h) / 2;
                    x = 0;
                } else {
                    h = boxHeight;
                    w = h * wh;
                    x = (boxWidth - w) / 2;
                    y = 0;
                }
            }
        }
        return {
            x: x,
            y: y,
            width: w,
            height: h,
        };
    }

    /**
     * 將 YQRect 的位置寬高應用到某個物件
     * @param {HTMLElement} parentDOM 指定元素
     * @param {YQRect} rect 位置寬高
     */
    static setRect(parentDOM: HTMLElement, rect: YQRect) {
        const px: string = 'px';
        parentDOM.style.left = rect.x + px;
        parentDOM.style.top = rect.y + px;
        parentDOM.style.width = rect.width + px;
        parentDOM.style.height = rect.height + px;
    }
}
