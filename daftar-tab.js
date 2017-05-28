(function(win, doc) {

    var hash = (new Date()).getTime(),
        defaults = {
        blogUrl: "http://edencreative.blogspot.co.id/", // Blog URL
        containerId: "tab-sitemap", // Container ID
        activeTab: 1, // The default active tab index (default: the first tab)
        showDates: false, // true to show the post date
        showSummaries: false, // true to show the posts summaries
        numChars: 200, // Number of summary chars
        monthNames: [ // Array of month names
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember"
        ],
        newTabLink: true, // Open link in new window?
        maxResults: 99999, // Maximum posts result
        preload: 0, // Load the feed after 0 seconds (option => time in milliseconds || "onload")
        sortAlphabetically: true, // `false` to sort posts by date
        showNew: true, // `false` to hide the "New!" mark in most recent posts, or define how many recent posts are to be marked
        newText: ' &ndash; <em style="color:red;">New!</em>' // HTML for the "New!" text
    };

    if (typeof tabSitemap === "undefined") {
        tabSitemap = defaults;
    } else {
        for (var i in defaults) {
            defaults[i] = typeof tabSitemap[i] !== "undefined" ? tabSitemap[i] : defaults[i];
        }
    }

    win['clickTabs_' + hash] = function(pos) {
        var a = document.getElementById(defaults.containerId),
            b = a.getElementsByTagName('ol'),
            c = a.getElementsByTagName('ul')[0],
            d = c.getElementsByTagName('a');
        for (var t = 0, ten = b.length; t < ten; ++t) {
            b[t].style.display = "none";
            b[parseInt(pos, 10)].style.display = "block";
        }
        for (var u = 0, uen = d.length; u < uen; ++u) {
            d[u].className = "";
            d[parseInt(pos, 10)].className = "active-tab";
        }
    };

    win['showTabs_' + hash] = function(json) {

        var total = parseInt(json.feed.openSearch$totalResults.$t, 10),
            c = defaults,
            entry = json.feed.entry,
            category = json.feed.category,
            skeleton = "",
            newPosts = [];

        for (var g = 0; g < (c.showNew === true ? 5 : c.showNew); ++g) {
            if (g === entry.length) break;
            entry[g].title.$t = entry[g].title.$t + (c.showNew !== false ? c.newText : "");
        }

        entry = c.sortAlphabetically ? entry.sort(function(a, b) {
            return a.title.$t.localeCompare(b.title.$t);
        }) : entry;

        category = c.sortAlphabetically ? category.sort(function(a, b) {
            return a.term.localeCompare(b.term);
        }) : category;
        // Build the tabs skeleton
        skeleton = '<nav class="sitemap-tabs"><ol>';
        for (var h = 0, cen = category.length; h < cen; ++h) {
            skeleton += '<li class="sitemap-tab-item-' + h + '"><a onclick="clickTabs_' + hash + '(' + h + ');return false;" onmousedown="return false;" href="javascript:;">' + category[h].term + '</a></li>';
        }
        skeleton += '</ol></nav>';
        // Bulid the tabs contents skeleton
        skeleton += '<div class="sitemap-content">';
        for (var i = 0, cen = category.length; i < cen; ++i) {
            skeleton += '<ul class="panel" data-category="' + category[i].term + '"';
            skeleton += (i != (c.activeTab-1)) ? ' style="display:none;"' : '';
            skeleton += '>';
            for (var j = 0; j < total; ++j) {
                if (j === entry.length) break;
                var link, entries = entry[j],
                    pub = entries.published.$t, // Get the post date
                    month = c.monthNames, // Month array from the configuration
                    title = entries.title.$t, // Get the post title
                    summary = ("summary" in entries && c.showSummaries === true) ? entries.summary.$t.replace(/<br *\/?>/g," ").replace(/<.*?>/g,"").replace(/[<>]/g,"").substring(0, c.numChars) + '&hellip;' : "", // Get the post summary
                    cat = entries.category || [], // Post categories
                    date = c.showDates ? '<time datetime="' + pub + '" title="' + pub + '">' + pub.substring(8, 10) + ' ' + month[parseInt(pub.substring(5, 7), 10) - 1] + ' ' + pub.substring(0, 4) + '</time>' : ""; // Formated published date
                    
                for (var k = 0, ken = entries.link.length; k < ken; ++k) {
                    if (entries.link[k].rel === "alternate") {
                        link = entries.link[k].href; // Get the post URL
                        break;
                    }
                }
                for (var l = 0, check = cat.length; l < check; ++l) {
                    var target = c.newTabLink ? ' target="_blank"' : ""; // Open link in new window?
                    // Write the list skeleton only if at least one of the post...
                    // ... has the same category term with one of the current categories term list
                    if (cat[l].term === category[i].term) {
                        skeleton += '<li title="' + cat[l].term + '"';
                        skeleton += c.showSummaries ? ' class="bold"' : "";
                        skeleton += '><a href="' + link + '"' + target + '>' + title + date + '</a>';
                        skeleton += '</li>';
                    }
                }
            }
            skeleton += '</ul>';
        }

        skeleton += '</div>';
        skeleton += '<div style="clear:both;"></div>';
        doc.getElementById(c.containerId).innerHTML = skeleton;
        win['clickTabs_' + hash](c.activeTab - 1);

    };

    var h = doc.getElementsByTagName('head')[0],
        s = doc.createElement('script');
        s.src = defaults.blogUrl.replace(/\/+$|[\?&#].*$/g, "") + '/feeds/posts/summary?alt=json-in-script&max-results=' + defaults.maxResults + '&orderby=published&callback=showTabs_' + hash;
    if (defaults.preload !== "onload") {
        win.setTimeout(function() {
            h.appendChild(s);
        }, defaults.preload);
    } else {
        win.onload = function() {
            h.appendChild(s);
        };
    }

})(window, document);
