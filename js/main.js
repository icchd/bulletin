var m = function () { return moment.apply(this, arguments).locale("en-gb"); }

var markdown = new Remarkable();

function getNextSunday() {
    var days = 0;
    while (m().add(days, "days").format("dddd") !== "Sunday") {
        days++;
    }
    return m().add(days, "days").format("LL");
}

var oBooks = {
    abbrev: {
         "Genesis": "Gen", "Exodus": "Exod", "Leviticus": "Lev", "Numbers": "Num", "Deuteronomy": "Deut", "Joshua": "Josh", "Judges": "Judg", "Ruth": "Ruth", "1 Samuel": "1 Sam", "2 Samuel": "2 Sam", "1 Kings": "1 Kgs", "2 Kings": "2 Kgs", "1 Chronicles": "1 Chr", "2 Chronicles": "2 Chr", "Ezra": "Ezra", "Nehemiah": "Neh", "Esther": "Esth", "Job": "Job", "Psalms": "Ps(s)", "Proverbs": "Prov", "Ecclesiastes": "Eccl", "Song of Songs": "Song", "Isaiah": "Isa", "Jeremiah": "Jer", "Lamentations": "Lam", "Ezekiel": "Ezek", "Daniel": "Dan", "Hosea": "Hos", "Joel": "Joel", "Amos": "Amos", "Obadiah": "Obad", "Jonah": "Jonah", "Micah": "Mic", "Nahum": "Nah", "Habakkuk": "Hab", "Zephaniah": "Zeph", "Haggai": "Hag", "Zechariah": "Zech", "Malachi": "Mal", "Matthew": "Matt", "Mark": "Mark", "Luke": "Luke", "John": "John", "Acts": "Acts", "Romans": "Rom", "1 Corinthians": "1 Cor", "2 Corinthians": "2 Cor", "Galatians": "Gal", "Ephesians": "Eph", "Philippians": "Phil", "Colossians": "Col", "1 Thessalonians": "1 Thess", "2 Thessalonians": "2 Thess", "1 Timothy": "1 Tim", "2 Timothy": "2 Tim", "Titus": "Titus", "Philemon": "Phlm", "Hebrews": "Heb", "James": "Jas", "1 Peter": "1 Pet", "2 Peter": "2 Pet", "1 John": "1 John", "2 John": "2 John", "3 John": "3 John", "Jude": "Jude", "Revelation": "Rev"
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
                input.data = m(input.data, "D MMMM YYYY").subtract(iAmount, "days").format("LL");
            }
        },
        increaseData: function (iAmount) {
            if (input.type === "daypicker") {
                input.data = m(input.data, "MM/DD/YYYY").add(iAmount, "months").format("MM/DD/YYYY");
            } else if (input.type === "sundaypicker") {
                input.data = m(input.data, "D MMMM YYYY").add(iAmount, "days").format("LL");
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
        description: "New Appointment"
    };
}
            
var app = new Vue({
    el: "#app",
    data: {
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
            date: getNextSunday(),
            image: {
                enabled: true,
                src: "https://placeholdit.imgix.net/~text?txtsize=33&txt=Image&w=230&h=230"
            },
            title: "Easter Sunday",
            text: "**Lorem ipsum** dolor sit amet, consectetur adipiscing elit. Curabitur ultricies quam vel elit pulvinar, ac iaculis neque maximus. Nulla vitae sapien metus. Sed bibendum vestibulum elementum. Nullam sagittis in nunc id condimentum. Ut semper interdum mi. Aenean et purus nec tortor convallis porttitor eu non nunc. Nulla facilisi. Maecenas tempor ultricies quam sed imperdiet. Cras fringilla, ante in convallis viverra, urna massa lacinia massa, at rhoncus erat quam at est. Proin ut tincidunt erat. Ut mollis consequat elit, vitae laoreet justo hendrerit sit amet. Proin volutpat venenatis leo at tristique. Aenean ac ornare erat, nec euismod odio. Proin tempor accumsan gravida. Suspendisse sit amet consequat sapien.  Morbi euismod commodo massa, vel elementum urna tincidunt sed. Suspendisse cursus, nunc et imperdiet laoreet, elit erat efficitur diam, ut convallis est purus ac augue. Pellentesque eu dolor aliquet, sodales nisl efficitur, dignissim nisl. Morbi vel ultricies dolor. In facilisis condimentum ultrices. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean volutpat mauris id mi lobortis mattis. Suspendisse eget dapibus odio, eu luctus mauris. Donec vitae cursus ex. Suspendisse id interdum nisl. Fusce vulputate nibh sapien, sed cursus mi euismod vitae.  Nunc mauris mi, placerat eu sem congue, euismod faucibus tellus. Cras pretium augue nunc, sed elementum dui varius et. Proin ut tempor felis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aliquam dictum, velit in suscipit fermentum, leo ligula laoreet dolor, eu semper lorem risus ut sapien. Nunc a accumsan velit, nec tristique augue. Vivamus viverra ipsum est, eu elementum est tempor at. Praesent cursus nunc vel lorem viverra, non luctus lectus lacinia. In at molestie velit, malesuada pretium ex.  Pellentesque eget erat pretium, pretium nulla in, dictum lectus. Aliquam eleifend posuere orci, ac scelerisque leo scelerisque sit amet. Vestibulum ultricies luctus rutrum. Vivamus sit amet vestibulum ex. In gravida magna felis, vel tempus leo condimentum quis. Quisque tellus erat, rhoncus vel euismod at, faucibus at orci. Mauris elementum condimentum odio, id hendrerit lorem blandit sit amet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam massa quam, consequat vel condimentum et, ultrices a tellus. Donec nisi nunc, ullamcorper vitae diam at, maximus imperdiet magna. Suspendisse potenti. Phasellus id ligula enim. Integer molestie rhoncus semper.  Suspendisse potenti. Vestibulum quis lectus sagittis, efficitur erat quis, efficitur quam. Morbi interdum commodo nisi ac iaculis. Vivamus nec viverra lacus. Nam tempor, dui non dapibus sagittis, diam risus porttitor felis, ac elementum est dui ac dolor. Nullam viverra magna quis augue cursus, id pulvinar ex fermentum. Vestibulum at cursus magna. Mauris lobortis arcu in urna placerat, suscipit fermentum nisl imperdiet. Vivamus sit amet odio sed lectus malesuada ultricies eu a augue. Nulla rutrum interdum purus eget vestibulum. Proin a est erat. Nulla ac metus sed justo suscipit ornare quis elementum ex. Fusce cursus molestie libero, id tincidunt eros venenatis ac.",
            father: "Welcome Father John",
            source: "Enter a source",
            reading1: "Reading 1",
            reading2: "Reading 2",
            reading3: "Gospel",
            appointments: [ formatAppointment(m()) ],
            colors: {
               color1: "000",
            },
            fonts: {
                text: {
                    family: "Georgia",
                    size: 11
                }
            }
        }
    },
    components: {
      'slider-picker': VueColor.Slider
    },
    methods: {
        updateColor1: function (oColor) {
            app.bullettin.colors.color1 = oColor.hex;
        },
        toggleImage: function () {
            app.bullettin.image.enabled = !app.bullettin.image.enabled;
        },
        increaseFontSize: function () {
            app.bullettin.fonts.text.size++;
        },
        decreaseFontSize: function () {
            app.bullettin.fonts.text.size--;
        },
        saveBullettin: function () {
            // TODO
        },
        addAppointment: function () {
            app.bullettin.appointments.push(formatAppointment(m()));

            app.bullettin.appointments = app.bullettin.appointments.sort(
                function (a, b) { return a.epoch >= b.epoch; }
            );
        },
        md2html: function (sMarkdown) {
            return markdown.render(sMarkdown);
        },
        showInput: function (sType, sPathToData, oOptionalObject) {
            function getData(sPath) {
                var oObjToModify = oOptionalObject;
                if (!oOptionalObject) {
                    oObjToModify = app;
                }
                return sPath
                    .split(".")
                    .reduce(function (vPrev, sKey) {
                        return vPrev[sKey];
                    }, oObjToModify);
            }
            function saveData(sPath, vData) {
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
            }

            input.type = sType;
            input.data = getData(sPathToData);

            if (sType === "textbox"
                || sType === "sundaypicker"
                || sType === "readingpicker") {

                input.done = function (sText) {
                    saveData(sPathToData, sText);
                };
            } else if (sType === "daypicker") {

                input.done = function (sDate) {
                    var iDate = parseInt(sDate, 10);
                    if (!oOptionalObject) {
                        throw Error("cannot update date object");
                    }
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

