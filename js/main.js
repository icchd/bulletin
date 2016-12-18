
var S_TITLE_DATE_FORMAT = "MMMM D, YYYY";

function arraySwapInPlace (A, a, b) {
    /*
     * Utility function to swap two elements of an array in place.
     */
    var iAlen = A.length;
    var iApos = A.indexOf(a);
    var iBpos = A.indexOf(b);

    var aAitems = [];
    while (A.length) {
        aAitems.push(A.shift());
    }
    aAitems.map(function (x, i) {
        if (i === iApos) {
            return iBpos;
        }
        if (i === iBpos) {
            return iApos;
        }
        return i;
    }).forEach(function (iPushFrom) {
        A.push(aAitems[iPushFrom]);
    });

};

var m = function () { return moment.apply(this, arguments).locale("en-gb"); }

var markdown = new showdown.Converter();

function getNextSunday(sFormat) {
    var days = 0;
    while (m().add(days, "days").format("dddd") !== "Sunday") {
        days++;
    }
    return m().add(days, "days").format(sFormat || "LL");
}

// http://youmightnotneedjquery.com/
function getJson(sUrl) {
    if (!app._urlCache) {
        app._urlCache = {};
    }
    if (app._urlCache[sUrl]) {
        return new Promise(function (fnResolve) {
            fnResolve(app._urlCache[sUrl]);
        });
    }
    return new Promise(function (fnResolve, fnReject) {
        var request = new XMLHttpRequest();
        request.open('GET', sUrl, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                var data = JSON.parse(request.responseText);
                app._urlCache[sUrl] = data;
                fnResolve(data);
            } else {
                // We reached our target server, but it returned an error
                fnReject();
            }
        };

        request.onerror = function() {
            // There was a connection error of some sort
            fnReject();
        };

        request.send();
    });
}


var oBooks = {
    abbrev: {
         "1 Chronicles": "1 Chr",
         "1 Corinthians": "1 Cor",
         "1 John": "1 John",
         "1 Kings": "1 Kgs",
         "1 Peter": "1 Pet",
         "1 Samuel": "1 Sam",
         "1 Thessalonians": "1 Thess",
         "1 Timothy": "1 Tm",
         "2 Chronicles": "2 Chr",
         "2 Corinthians": "2 Cor",
         "2 John": "2 John",
         "2 Kings": "2 Kgs",
         "2 Peter": "2 Pet",
         "2 Samuel": "2 Sam",
         "2 Thessalonians": "2 Thess",
         "2 Timothy": "2 Tm",
         "3 John": "3 John",
         "Acts": "Acts",
         "Amos": "Amos",
         "Colossians": "Col",
         "Daniel": "Dan",
         "Deuteronomy": "Deut",
         "Ecclesiastes": "Eccl",
         "Ephesians": "Eph",
         "Esther": "Esth",
         "Exodus": "Exod",
         "Ezekiel": "Ezek",
         "Ezra": "Ezra",
         "Galatians": "Gal",
         "Genesis": "Gen",
         "Habakkuk": "Hab",
         "Haggai": "Hag",
         "Hebrews": "Heb",
         "Hosea": "Hos",
         "Isaiah": "Is",
         "James": "Jas",
         "Jeremiah": "Jer",
         "Job": "Job",
         "Joel": "Joel",
         "John": "John",
         "Jonah": "Jonah",
         "Joshua": "Josh",
         "Jude": "Jude",
         "Judges": "Judg",
         "Lamentations": "Lam",
         "Leviticus": "Lev",
         "Luke": "Lk",
         "Malachi": "Mal",
         "Mark": "Mark",
         "Matthew": "Mt",
         "Micah": "Mic",
         "Nahum": "Nah",
         "Nehemiah": "Neh",
         "Numbers": "Num",
         "Obadiah": "Obad",
         "Philemon": "Phlm",
         "Philippians": "Phil",
         "Proverbs": "Prov",
         "Psalms": "Ps(s)",
         "Revelation": "Rev",
         "Romans": "Rom",
         "Ruth": "Ruth",
         "Sirach": "Sir",
         "Song of Songs": "Song",
         "Titus": "Titus",
         "Zechariah": "Zech",
         "Zephaniah": "Zeph"
    }
};

/*
 * Inputs
 *
 * type : data type
 * - textbox : string
 * - sundaypicker : "6 November 2016" (a sunday)
 * - readingpicker : "Acts 10:34a, 37-43"
 */
var oInputTypes = {
    textbox: {},
    appointmentTextbox: {},
    sundaypicker: {},
    daypicker: {},
    readingpicker: {
        dataSuggestFunction: function (sSearchRaw) {
            var aSearchSplit = sSearchRaw.split(" ");
            var sSearch = aSearchSplit[0] || "";
            if (sSearch.match(/\d/)) {
                aSearchSplit.shift();
                sSearch += " " + aSearchSplit.shift();
            }
            var sSearchLower = sSearch.toLowerCase();

            if (!oBooks.keywords || !oBooks.abbrev_rev) {
                oBooks.keywords = [];
                oBooks.abbrev_rev = {};
                Object.keys(oBooks.abbrev).forEach(function (sLong) {
                    // build reverse list
                    var sShort = oBooks.abbrev[sLong];

                    oBooks.abbrev_rev[sShort] = sLong;

                    var oValue = {
                        short: sShort,
                        long: sLong,
                        toString: function () { return sShort; }
                    };
 
                    oBooks.keywords.push({
                        keyword: sLong.toLowerCase(),
                        value: oValue
                    });
                    oBooks.keywords.push({
                        keyword: sShort.toLowerCase(),
                        value: oValue
                    });
                });
            }

            if (oBooks.abbrev_rev[sSearch]) {
                return [];
            }
            if (oBooks.abbrev[sSearch]) {
                return [{
                    long: sSearch,
                    short: oBooks.abbrev[sSearch]
                }];
            }

            var oUniq = {};
            return oBooks.keywords.filter(function(oKeyword) {
                if (oKeyword.keyword.indexOf(sSearchLower) >= 0) {
                    return true;
                }
                return false;
            })
            .map(function (oKeyword) {
                return oKeyword.value;
            })
            .reduce(function (oCurrent, oNext) {
                if (!oUniq[oNext.short]) {
                    oUniq[oNext.short] = true;
                    oCurrent.push(oNext);
                }
                return oCurrent;
            }, []);
        }
    }
};

var input = new Vue({
    el: "#inputDialog",
    data: {
        show: false,
        type: "daypicker",
        data: "12/20/1984",
        done: function () { },
        dataSuggestions: [{ short: "Sug1", long: "Suggestion1" },
            {short: "Sug2", long: "Suggestion2" }],
        dataSuggestFunction: function () {}
    },
    methods: {
        cancel: function () {
            input.show = false;
        },
        ok: function () {
            input.show = false;

            // save the data
            input.done(input.data);
        },
        okDay: function (sDate) {
            input.data = sDate;
            input.ok();
        },
        updateDataSuggestions: function () {
            input.dataSuggestions = getBibleBookSuggestions(input.data);
        },
        decreaseData: function (iAmount) {
            if (input.type === "daypicker") {
                input.data = m(input.data, "MM/DD/YYYY").subtract(iAmount, "months").format("MM/DD/YYYY");
            } else if (input.type === "sundaypicker") {
                input.data = m(input.data, S_TITLE_DATE_FORMAT).subtract(iAmount, "days").format(S_TITLE_DATE_FORMAT);
            }
        },
        increaseData: function (iAmount) {
            if (input.type === "daypicker") {
                input.data = m(input.data, "MM/DD/YYYY").add(iAmount, "months").format("MM/DD/YYYY");
            } else if (input.type === "sundaypicker") {
                input.data = m(input.data, S_TITLE_DATE_FORMAT).add(iAmount, "days").format(S_TITLE_DATE_FORMAT);
            }
        },
        selectSuggestion: function (oSuggestion) {
            var aInputData = input.data.split(" ");
            aInputData.shift();
            aInputData.unshift(oSuggestion.toString());
            input.data = aInputData.join(" ");
        }
    },
    watch: {
        show: function (bNew, bOld) {
            if (bNew === true && oInputTypes[input.type].dataSuggestFunction) {
                input.dataSuggestFunction = oInputTypes[input.type].dataSuggestFunction;
            } else if (bNew === false) {
                input.dataSuggestFunction = function () {};
            }
        },
        data: function (vDataNew, vDataOld) {
            input.dataSuggestions = input.dataSuggestFunction(vDataNew);
        }
    }
});

function formatAppointment(vAppointment) {
    var mObj = vAppointment;
    if (typeof vAppointment === "string") {
        mObj = m(vAppointment);
    }

    var sFormat = "D MMMM";
    if (mObj.format("YYYY") !== m().format("YYYY")) {
        sFormat = "LL";
    }

    return {
        epoch: "" + mObj.valueOf(),
        date: mObj.format(sFormat),
        description: "New Appointment " + app.bullettin.appointments.length
    };
}
            
var app = new Vue({
    el: "#app",
    data: {
        history: [
        ],
        themes: {
            White: {
                color1: "#FFF",
                color2: "#333",
                border: "#333"
            },
            Red: {
                color1: "#9D0000",
                color2: "#FFF",
                border: "#FFF"
            },
            Green: {
                color1: "#3BBD00",
                color2: "#FFF",
                border: "#FFF"
            },
            Violet: {
                color1: "#9B00BD",
                color2: "#FFF",
                border: "#FFF"
            },
            Black: {
                color1: "#000",
                color2: "#FFF",
                border: "#FFF"
            },
            Rose: {
                color1: "#FFCAEA",
                color2: "#000",
                border: "#FFF"
            },
            Gold: {
                color1: "#CECA2F",
                color2: "#000",
                border: "#FFF"
            }
        },
        toolbar: {
            current: "color"
        },
        colors: {
          hex: '#194d33',
          hsl: {
            h: 150,
            s: 0.5,
            l: 0.2,
            a: 1
          },
          hsv: {
            h: 150,
            s: 0.66,
            v: 0.30,
            a: 1
          },
          rgba: {
            r: 25,
            g: 77,
            b: 51,
            a: 1
          },
          a: 1
        },
        bullettin: {
            password: "",
            date: getNextSunday(S_TITLE_DATE_FORMAT),
            saveAs: getNextSunday("YYYY-MM-DD") + "-bullettin.markdown",
            dateChanged: m().format("YYYY-MM-DD hh:mm:ss +02:00"),
            image: {
                enabled: true,
                src: "https://placeholdit.imgix.net/~text?txtsize=33&txt=Image&w=230&h=230",
                layout: "left",
                size: 50
            },
            title: "Easter Sunday",
 text: "The type of text that you can enter in this box is called **markdown**. Markdown allows you to type rich text using symbols around text to provide meaning. This is a paragraph, because it's followed by a blank line.\n\n **See more examples below!**\n\nThree dashes will generate a horizontal ruler. Make sure there is one empty line before and after the ---.\n \n See? ▼\n \n ---\n\n# Heading 1\n\n## Heading 2\n\n### Heading 3\n\n This is **bold text**, this is *italic*.\n \n This is a paragraph... blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah.\n \n This is an inline image: ![](https://placeholdit.imgix.net/~text?txtsize=22&txt=image&w=100&h=100). Inline images start with the symbol `![]` and contain the URL of the image in parentheses.\n\nYou don't have to use the full blown markdown syntax, but you can if you want to. Perhaps for the purpose of this tool, you may just need to tweak copy-pasted text (e.g., by separating it in paragraphs).",
            father: "Welcome Father John",
            source: "Source line 1 \nSource line 2. (this empty space is for the pencil icon, it's not printed on paper!) ->",
            reading1: "Reading 1",
            reading2: "Reading 2",
            reading3: "Gospel",
            newsletter: "infoheidelberg@internationalcatholiccommunity.com",
            appointments: [ ],
            colors: {
               color1: "#000",
               color2: "#FFF",
               border: "#FFF"
            },
            fonts: {
                text: {
                    family: "Georgia",
                    lineHeight: 12,
                    size: 11,
                    paragraphMargin: 5
                }
            }
        }
    },
    components: {
      'slider-picker': VueColor.Slider
    },
    methods: {
        changeFontEvent: function () {
            console.log("Changed" + app.bullettin.fonts.text.family);
        },
        selectTab: function (sTabName) {
            app.toolbar.current = sTabName;
        },
        updateColor1: function (oColor) {
            app.bullettin.colors.color1 = oColor.hex;
        },
        updateColor2: function (oColor) {
            app.bullettin.colors.color2 = oColor.hex;
        },
        toggleImage: function () {
            var bEnabled = app.bullettin.image.enabled;
            var sLayout = app.bullettin.image.layout;
            
            app.historySave("bullettin.image");

            if (bEnabled) {
                switch (sLayout) {
                    case "left":
                        app.bullettin.image.layout = "right";
                        break;
                    case "right":
                        app.bullettin.image.layout = "left";
                        app.bullettin.image.enabled = false;
                        break;
                }
            } else {
                app.bullettin.image.enabled = true;
            }
        },
        increaseImageWidth: function () {
            if (app.bullettin.image.size === 0) {
                return;
            }
            app.historySave("bullettin.image.size");
            app.bullettin.image.size -= 2.5;
        },
        decreaseImageWidth: function () {
            if (app.bullettin.image.size === 100) {
                return;
            }
            app.historySave("bullettin.image.size");
            app.bullettin.image.size += 2.5;
        },
        decreaseParagraphMargin: function () {
            var oDecrease = {
                1: 1,
                2: 1,
                5: 2,
                10: 5,
                20: 10,
                30: 20
            };
            var iCurrent = app.bullettin.fonts.text.paragraphMargin;
            if (oDecrease[iCurrent] !== iCurrent) {
                app.historySave("bullettin.fonts.text.paragraphMargin");
            }
            app.bullettin.fonts.text.paragraphMargin = oDecrease[iCurrent];
        },
        increaseParagraphMargin: function () {
            var oIncrease = {
                1: 2,
                2: 5,
                5: 10,
                10: 20,
                20: 30,
                30: 30
            };
            var iCurrent = app.bullettin.fonts.text.paragraphMargin;
            if (oIncrease[iCurrent] !== iCurrent) {
                app.historySave("bullettin.fonts.text.paragraphMargin");
            }
            app.bullettin.fonts.text.paragraphMargin = oIncrease[iCurrent];
        },
        increaseFontSize: function () {
            app.historySave("bullettin.fonts.text.size");
            app.bullettin.fonts.text.size+=0.5;
        },
        decreaseFontSize: function () {
            if (app.bullettin.fonts.text.size > 1) {
                app.historySave("bullettin.fonts.text.size");
                app.bullettin.fonts.text.size-=0.5;
            }
        },
        increaseLineHeight: function () {
            app.historySave("bullettin.fonts.text.lineHeight");
            app.bullettin.fonts.text.lineHeight+=0.5;
        },
        decreaseLineHeight: function () {
            if (app.bullettin.fonts.text.lineHeight > 1) {
                app.historySave("bullettin.fonts.text.lineHeight");
                app.bullettin.fonts.text.lineHeight-=0.5;
            }
        },
        publishBullettin: function () {
            // first make sure the bullettin is published

            function sendPublishRequest() {
                return new Promise(function (fnDone, fnError) {
                    var request = new XMLHttpRequest();
                    request.onreadystatechange = function () {
                        if (request.readyState === XMLHttpRequest.DONE) {
                            try {
                                fnDone(JSON.parse(request.responseText));
                            } catch (oError) {
                                fnError(oError);
                            }
                        }
                    };
                    request.open("POST", "https://icch-api.herokuapp.com/bullettin", true);
                    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                    request.send(JSON.stringify(app.bullettin));
                });
            }

            function publishToFacebook() {
                FB.login(function(){
                  FB.api("/InternationalCatholicCommunityofHeidelberg?fields=access_token", 'get', function (o) { 
                    if (!o.access_token) {
                        alert.show("error", "Something went wrong while getting access token. Try again.");
                        return;
                    }
                    var sAccessToken = o.access_token;
                    FB.api(
                        '/InternationalCatholicCommunityofHeidelberg/feed', 
                        'post', {
                            message: 'Our bullettin for Sunday mass on ' + app.bullettin.date + ' is available.',
                            link: 'http://www.google.com', // TODO: point to ICCH post
                            access_token: sAccessToken 
                        }, function (oRes) { 
                            if (oRes.error) {
                                alert.show("error", "An error occurred while publishing the bullettin. Try again.");
                                return;
                            }
                            alert.show("confirm", "The bullettin was published on Facebook!");
                        });
                  });
                  
                }, {scope: 'manage_pages,publish_pages'});
            }

            sendPublishRequest().then(function (oResponse) {
                if (!oResponse.success) {
                    alert.show("error", oResponse.message);
                    return;
                } else {
                    alert.show("confirm", oResponse.message);
                }
            }, function (oError) {
                alert.show("error", "" + oError);
            });
            
        },
        addAppointment: function () {
            app.historySave("bullettin.appointments");
            app.bullettin.appointments.push(formatAppointment(m()));
        },
        deleteAllAppointments: function () {
            app.historySave("bullettin.appointments");
            app.bullettin.appointments = [];
        },
        sortAppointments: function () {
            app.historySave("bullettin.appointments");
            app.bullettin.appointments = app.bullettin.appointments.sort(
                function (a, b) { return a.epoch >= b.epoch; }
            );
        },
        moveAppointmentUp: function (oAppointment) {
            var aBullettinAppointments = app.bullettin.appointments;
            var nAppointments = aBullettinAppointments.length;
            var iAppointmentPosition = aBullettinAppointments.indexOf(oAppointment);

            if (iAppointmentPosition === 0) {
                alert.show("error", "cannot move appointment up");
                return;
            }
            app.historySave("bullettin.appointments");

            var oPrevAppointment = aBullettinAppointments[iAppointmentPosition - 1];
            arraySwapInPlace(aBullettinAppointments, oAppointment, oPrevAppointment);

        },
        moveAppointmentDown: function (oAppointment) {
            var aBullettinAppointments = app.bullettin.appointments;
            var nAppointments = aBullettinAppointments.length;
            var iAppointmentPosition = aBullettinAppointments.indexOf(oAppointment);

            if (iAppointmentPosition === nAppointments - 1) {
                alert.show("error", "cannot move appointment down");
                return;
            }
            app.historySave("bullettin.appointments");

            var oNextAppointment = aBullettinAppointments[iAppointmentPosition + 1];
            arraySwapInPlace(aBullettinAppointments, oAppointment, oNextAppointment);
        },
        deleteAppointment: function (oAppointment) {
            app.historySave("bullettin.appointments");
            app.bullettin.appointments = app.bullettin.appointments.filter(
                function (oAppointmentFromList) {
                    return oAppointmentFromList !== oAppointment;
                }
            );
        },
        md2html: function (sMarkdown) {
            return markdown.makeHtml(sMarkdown);
        },
        txt2html: function (sText) {
            return sText.replace(/\n/g, "<br />");
        },
        setTheme: function (sThemeName) {
            if (!app.themes.hasOwnProperty(sThemeName)) {
                alert.show("error", sThemeName + " is not a valid theme");
            } else {
                app.historySave("bullettin.colors");
                app.bullettin.colors.color1 = app.themes[sThemeName].color1;
                app.bullettin.colors.color2 = app.themes[sThemeName].color2;
                app.bullettin.colors.border = app.themes[sThemeName].border;
            }
        },
        updateReadingFromSunday: function () {
            function getReading(oResponse, sType) {
                return oResponse.ReadingGroups[0].Readings.filter(
                    function (oReading) { return oReading.Type === sType; }
                )[0];
            }
            function abbrevReading(sReading) {
                var aReading = sReading.split(" ");
                var sBookName = aReading.shift();
                while (aReading.length) {
                    if (oBooks.abbrev.hasOwnProperty(sBookName)) {
                        return oBooks.abbrev[sBookName] + " " + aReading.join(" ");
                    }
                    sBookName += " " + aReading.shift();
                }

                if (aReading.length === 0) {
                    // return original
                    return sReading;
                }
            }
            var sSelectedSunday = m(app.bullettin.date, "D MMMM YYYY").format("YYYY-MM-DD");
            getJson('https://www.ewtn.com/se/readings/readingsservice.svc/day/' + sSelectedSunday + '/en')
                .then(function (oResponse) {

                    try {
                        app.historySave("bullettin.reading1");
                        app.historySave("bullettin.reading2");
                        app.historySave("bullettin.reading3");

                        // erase current readings
                        [1,2,3].forEach(function (x) {
                            app.bullettin['reading' + x] = "";
                        });
                        // get the first reading
                        var oReading1 = getReading(oResponse, "Reading 1");
                        var oReading2 = getReading(oResponse, "Reading 2");
                        var oReading3 = getReading(oResponse, "Gospel");
                        if (!oReading2) {
                            oReading2 = getReading(oResponse, "Psalm");
                        }

                        var sReading1 = abbrevReading(oReading1.Citations[0].Reference);
                        var sReading2 = abbrevReading(oReading2.Citations[0].Reference);
                        var sReading3 = abbrevReading(oReading3.Citations[0].Reference);

                        app.bullettin.reading1 = sReading1;
                        app.bullettin.reading2 = sReading2;
                        app.bullettin.reading3 = sReading3;
                        alert.show("confirm",
                            "Updated readings: " + [sReading1, sReading2, sReading3].join(", ")
                        );
                    } catch (e) {
                        throw new Error(e);
                        alert.show("error", "Error occurred while getting data for the Sunday");
                    }
                }, function () {
                    alert.show("error", "Error occurred while getting data for the Sunday");
                });
        },
        updateTitleFromSunday: function () {
            var sSelectedSunday = m(app.bullettin.date, "D MMMM YYYY").format("YYYY-MM-DD");
            getJson('https://www.ewtn.com/se/readings/readingsservice.svc/day/' + sSelectedSunday + '/en')
                .then(function (oResponse) {
                    try {
                        // got data
                        app.historySave("bullettin.title");
                        app.bullettin.title = oResponse.Title;
                        alert.show("confirm", "Title updated: '" + oResponse.Title + "'");
                    } catch (e) {
                        throw new Error(e);
                        alert.show("error", "Error occurred while getting data for the Sunday");
                    }
                    
                }, function () {
                    alert.show("error", "Error occurred while getting data for the Sunday");
                });
        },
        updateThemeFromSunday: function () {
            var sSelectedSunday = m(app.bullettin.date, "D MMMM YYYY").format("YYYY-MM-DD");
            getJson('https://www.ewtn.com/se/readings/readingsservice.svc/day/' + sSelectedSunday + '/en')
                .then(function (oResponse) {
                    try {
                        // got data
                        app.setTheme(oResponse.Color);
                        alert.show("confirm", "Theme was set: " + oResponse.Color);
                    } catch (e) {
                        throw new Error(e);
                        alert.show("error", "Error occurred while getting data for the Sunday");
                    }
                    
                }, function () {
                    alert.show("error", "Error occurred while getting data for the Sunday");
                });
        },
        saveDataToPath: function (sPath, vData, oOptionalObject) {
            var oObjToModify = oOptionalObject;
            if (!oOptionalObject) {
                oObjToModify = app;
            }
            var aPath = sPath.split(".");
            var oDataToUpdate = aPath.reduce(function (vPrev, sKey) {
                if (typeof vPrev[sKey] === "object") {
                    return vPrev[sKey];
                }
                return vPrev;
            }, oObjToModify);

            oDataToUpdate[aPath.pop()] = vData;
        },
        getDataFromPath: function (sPath, oOptionalObject) {
            var oObjToModify = oOptionalObject;
            if (!oOptionalObject) {
                oObjToModify = app;
            }
            return sPath
                .split(".")
                .reduce(function (vPrev, sKey) {
                    return vPrev[sKey];
                }, oObjToModify);
        },
        historySave: function (sPath, oOptionalObject) {
            var vData = app.getDataFromPath(sPath, oOptionalObject);

            if (Object.prototype.toString.call(vData) === "[object Object]"
                || Object.prototype.toString.call(vData) === "[object Array]" ) {
                vData = JSON.parse(JSON.stringify(vData));
            }
            app.history.push({
                path: sPath,
                pathRelativeTo: oOptionalObject || app,
                value: vData
            });
        },
        historyUndo: function () {
            if (app.history.length === 0) {
                return;
            }
            var oChange = app.history.pop();
            if (Object.prototype.toString.call(oChange.value) === "[object Object]") {
                Object.keys(oChange.value).forEach(function (sKey) {
                    app.saveDataToPath(
                        oChange.path + "." + sKey,
                        oChange.value[sKey],
                        oChange.pathRelativeTo
                    );
                });
            } else if (Object.prototype.toString.call(oChange.value) === "[object Array]") {
                // empty array in the change path
                var aArray = app.getDataFromPath(oChange.path);
                while (aArray.length) {
                    aArray.pop();
                }
                while (oChange.value.length) {
                    aArray.push(oChange.value.shift());
                }
            } else {
                app.saveDataToPath(oChange.path, oChange.value, oChange.pathRelativeTo);
            }
        },
        showInput: function (sType, sPathToData, oOptionalObject) {

            input.type = sType;
            input.data = app.getDataFromPath(sPathToData, oOptionalObject);

            if (sType === "textbox"
                || sType === "sundaypicker"
                || sType === "readingpicker") {

                input.done = function (sText) {
                    app.historySave(sPathToData, oOptionalObject);
                    app.saveDataToPath(sPathToData, sText, oOptionalObject);
                };
            } 
            else if (sType === "appointmentTextbox") {
                input.done = function (sText) {
                    app.historySave("bullettin.appointments");
                    app.saveDataToPath(sPathToData, sText, oOptionalObject);
                };
            }
            else if (sType === "daypicker") {

                input.done = function (sDate) {
                    var iDate = parseInt(sDate, 10);
                    if (!oOptionalObject) {
                        throw Error("cannot update date object");
                    }

                    app.historySave("bullettin.appointments");

                    var oNewAppointment = formatAppointment(m(iDate));
                    Object.keys(oOptionalObject).forEach(function (sCurrentObjKey) {
                        oOptionalObject[sCurrentObjKey] = oNewAppointment[sCurrentObjKey];
                    });
                };
            }

            input.show = true;
        }
    }
});

var alert = new Vue({
    el: "#messageToasts",
    data: {
        messages: [
        ]
    },
    methods: {
        show: function (sType, sText) {
            var oMessage = {
                display: true,
                type: sType,
                text: sText
            };
            alert.messages.push(oMessage);
            setTimeout(function () {
                oMessage.display = false;

                setTimeout(function () {
                    // garbage collect
                    alert.messages = alert.messages.filter(function (oMessage) {
                        return oMessage.display === true;
                    });
                }, 500);
            }, 4000);

        }
    }
});

