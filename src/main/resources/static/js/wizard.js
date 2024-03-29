var wiz = new function() {
    'use strict';
    var _this = this,
        timerIdentifier, waitTimerIdentifier, hoverTimerIdentifier, previousPageListJson, logoutTimerIdentifier, logoutTimeoutPeriod, liveRefreshTimerIdentifier, liveRefreshPeriod, postUpdateCall = null,
        defaultButtonOverride, helpButton = null,
        previousPage, previousRepeat, postDataCapture;
    this.formIsDirty = false;
    this.overridePostback = false;
    this.pushingState = true;
    this.lastFocusedControlId = '';
    this.lastScrollWindowPosition = 0;
    this.lastScrollGroupPosition = 0;
    this.pageListJson = '';
    this.hasValidationChanged = false;
    this.stateCustomUI = '';
    this.pgReloaded = false;
    this.tileDict = {};
    this.isCapturingData = false;
    this.capturedDataNodes = [];
    this.dataNode = {};
    this.intervalId = '';
    this.attachedEvents = ".form-control, .help-question, .analyticslog, .commentsIcon, input[type=radio], input[type=checkbox], input[type=button]";
    this.capturePath = '';
    this.intervals = [];
    this.isNative = false;
    this.removeAt = function removeAt(arr, from, to) {
        var rest = arr.slice((to || from) + 1 || arr.length);
        arr.length = from < 0 ? arr.length + from : from;
        arr.push.apply(arr, rest)
    };
    this.indexOf = function indexOf(arr, obj) {
        var l = arr.length,
            i = 0;
        for (i = 0; i < l; i++) {
            if (i in arr && arr[i] === obj) {
                return i
            }
        }
        return -1
    };
    var doKeepAlive = function doKeepAlive(logGuid) {
        $.ajaxSetup({
            cache: false
        });
        $.get($('#baseUrl').val() + 'Wizard/KeepAlive/' + logGuid)
    };
    this.dataCaptureInit = function dataCaptureInit(path) {
        _this.isCapturingData = true;
        _this.initDataCaptureListeners(path);
        _this.capturePath = path;
        if (!_this.intervalId) {
            _this.intervalId = setInterval(function() {
                wiz.postDataCapture(false)
            }, 10000)
        }
    };
    this.initDataCaptureListeners = function initDataCaptureListeners(path) {
        var logGuid = $('#hidLogGuid').val();
        $('#up ' + _this.attachedEvents).each(function() {
            $(this).on('blur', function(e) {
                _this.dataAnalyticsBlur()
            });
            $(this).on('focus', function(e) {
                var focusNode = $(this).data('analyticsid');
                var eventNode = $(this).data('analyticsevent');
                _this.dataAnalyticsFocus(focusNode, eventNode)
            })
        });
        $('#up input[type=submit]').each(function() {
            $(this).on('click', function(e) {
                var focusNode = $(this).data('analyticsid');
                var eventNode = $(this).data('analyticsevent');
                _this.dataAnalyticsFocusAndBlur(focusNode, eventNode)
            })
        });
        $('#up .analyticslogdd').each(function() {
            $(this).on('change', function(e) {
                var focusNode = $(this).find(':selected').data('analyticsid');
                var eventNode = $(this).data('analyticsevent');
                _this.dataAnalyticsFocus(focusNode);
                _this.dataAnalyticsBlur()
            })
        })
    };
    this.removeDataCaptureListeners = function removeDataCaptureListeners() {
        $('#up ' + _this.attachedEvents).each(function() {
            $(this).off('blur');
            $(this).off('focus')
        });
        $('#up input[type=submit]').each(function() {
            $(this).off('click')
        })
    };

    function dataCopyNode(logGuid, controlID, eventType, focusTimeUtc, blurTimeUtc, pageTitle) {
        this.logGuid = logGuid;
        this.controlID = controlID;
        this.eventType = eventType;
        this.focusTimeUtc = focusTimeUtc;
        this.blurTimeUtc = blurTimeUtc;
        this.pageTitle = pageTitle
    }

    function setIframeSource(iframe, sourceUrl) {
        if (_this.isNative) {
            NativeFunc("doGetUrl", sourceUrl, function(response) {
                iframe.attr('srcdoc', response)
            })
        } else {
            iframe.prop('src', sourceUrl)
        }
    }
    this.dataAnalyticsFocus = function dataAnalyticsFocus(controlID, eventType) {
        if (eventType == null) {
            eventType = ''
        }
        _this.dataNode = {
            logGuid: $('#hidLogGuid').val(),
            controlID: controlID,
            eventType: eventType,
            focusTimeUtc: this.getUTCNowISOString(),
            blurTimeUtc: '',
            pageTitle: $('#page-title').text()
        }
    };
    this.dataAnalyticsBlur = function dataAnalyticsBlur() {
        if (_this.dataNode && !_this.dataNode.blurTimeUtc && _this.dataNode.controlID) {
            _this.dataNode.blurTimeUtc = this.getUTCNowISOString();;
            _this.capturedDataNodes.push(new dataCopyNode(_this.dataNode.logGuid, _this.dataNode.controlID, _this.dataNode.eventType, _this.dataNode.focusTimeUtc, _this.dataNode.blurTimeUtc, _this.dataNode.pageTitle));
            _this.dataNode = {}
        }
    };
    this.getUTCNowISOString = function getUTCNowISOString() {
        return ((new Date).toISOString())
    };
    this.dataAnalyticsFocusAndBlur = function dataAnalyticsFocusAndBlur(controlID, eventType) {
        if (eventType == null) {
            eventType = ''
        }
        var logGuid = $('#hidLogGuid').val();
        _this.dataAnalyticsFocus(controlID, eventType);
        _this.dataAnalyticsBlur()
    };
    this.postDataCapture = function postDataCapture(force) {
        if (_this.capturedDataNodes && _this.capturedDataNodes.length > 0) {
            var uri = _this.capturePath + 'wizard/datacapture/';
            var stringifyData = JSON.stringify({
                dataNodes: _this.capturedDataNodes
            });
            $.ajax({
                type: 'POST',
                url: uri,
                data: stringifyData,
                async: force ? false : true,
                contentType: 'application/json',
                error: function(xhr, status, error) {},
                success: function(response, status, xhr) {}
            })
        }
        _this.capturedDataNodes.length = 0
    };
    var doLogOut = function doLogOut() {
        _this.clearDirtyState();
        window.location = $('#logUrl').val()
    };
    var doLiveRefresh = function doLiveRefresh() {
        _this.doAjaxPost($('#reloadPageUrl').val() + '&liveRefresh=true')
    };
    var showHelpResult = function showHelpResult(msg, showClose) {
        var pos = $(helpButton).offset(),
            scrollTop = $('.wizardContent').scrollTop(),
            scrollLeft = $('.wizardContent').scrollLeft(),
            left = scrollLeft + pos.left - 315;
        if (left < 0) {
            left = 0;
            pos.top += $(helpButton).height()
        }
        if (showClose) {
            $('#closeHelp').show()
        } else {
            $('#closeHelp').hide()
        }
        $('#HelpText').css({
            left: left + 'px',
            top: pos.top + scrollTop + 'px'
        });
        $('#HelpText').children('span').html(msg);
        $('#HelpText').show();
        $('#HelpText').focus()
    };
    var saveProgress = function saveProgress(description) {
        document.getElementById('hidSaveDescription').value = description;
        var url = $('#saveActionUrl').val() + addLatLonQueryString();
        _this.doAjaxPost(url)
    };
    var restoreFocus = function restoreFocus() {
        if (_this.lastScrollWindowPosition > 0) {
            $(window).scrollTop(_this.lastScrollWindowPosition)
        }
        if (_this.lastScrollGroupPosition > 0) {
            $('.Group').scrollTop(_this.lastScrollGroupPosition)
        }
        if (!(_this.lastFocusedControlId == null || _this.lastFocusedControlId === '' || _this.lastFocusedControlId === 'QuestionsInner')) {
            var ctl = $('#' + _this.lastFocusedControlId);
            if (ctl.length > 0 && ctl.is(':disabled') === false) {
                ctl.focus();
                if (_this.isCapturingData) {
                    _this.dataNode = {}
                }
            }
        }
    };
    var updatePlaceholder = function updatePlaceholder(html) {
        $('#up').html(html);
        setTimeout(restoreFocus, 100)
    };
    this.updateGenericPlaceholder = function updateGenericPlaceholder(placeholder, html) {
        $(placeholder).html(html);
        setTimeout(restoreFocus, 1)
    };
    var updateError = function updateError(text) {
        document.write(text)
    };
    var clearTimers = function clearTimers() {
        clearTimeout(timerIdentifier);
        clearTimeout(logoutTimerIdentifier);
        clearTimeout(liveRefreshTimerIdentifier);
        for (var i = 0; i < _this.intervals.length; i++) {
            clearInterval(_this.intervals[i])
        }
        _this.intervals = []
    };
    var saveFocus = function saveFocus() {
        var ctl = $('*:focus');
        if (ctl.length > 0) {
            _this.lastFocusedControlId = ctl.prop('id')
        } else {
            _this.lastFocusedControlId = ''
        }
        _this.lastScrollWindowPosition = $(window).scrollTop();
        _this.lastScrollGroupPosition = $('.Group').scrollTop()
    };
    var openWaitDialog = function openWaitDialog() {
        _this.clearWaitTimer();
        _this.closeModal();
        _this.closeLargeModal();
        $('#waitShort-modal').modal({
            backdrop: false,
            keyboard: false
        });
        $(document).unbind('keydown').bind('keydown', function(event) {
            event.preventDefault()
        });
        waitTimerIdentifier = setTimeout(_this.waitDialogTimerExpired, 1000)
    };
    var beforeSubmit = function beforeSubmit() {
        var id;
        clearTimers();
        saveFocus();
        openWaitDialog();
        if (window.tinyMCE) {
            try {
                for (var i = tinyMCE.editors.length - 1; i >= 0; i--) {
                    id = tinyMCE.editors[i].id;
                    tinyMCE.editors[i].remove();
                    $('#' + id).hide()
                }
            } catch (ignore) {
                tinyMCE.editors = []
            }
        }
        if ($('#ui-datepicker-div').is(':visible')) {
            $('#ui-datepicker-div').hide()
        }
    };

    function setInkValue(element) {
        var canvas = element,
            canvasId = $(element).prop('id'),
            data = '',
            ctx = canvas.getContext('2d'),
            drawn = false,
            d = ctx.getImageData(0, 0, canvas.width, canvas.height),
            len = d.data.length;
        var valueContainer = $('#' + (canvasId.substring(0, canvasId.length - 2)));
        var originalWidth = valueContainer.data('bk-width');
        var scaleRatio = originalWidth / canvas.width;
        for (var pixel = 0; pixel < len; pixel++) {
            if (d.data[pixel]) {
                drawn = true;
                break
            }
        }
        if (drawn) {
            var imgObj = new Image;
            imgObj.onload = function() {
                var newCanvas = $("<canvas>").prop("width", d.width * scaleRatio).prop("height", d.height * scaleRatio)[0];
                newCanvas.getContext("2d").drawImage(imgObj, 0, 0, d.width * scaleRatio, d.height * scaleRatio);
                data = newCanvas.toDataURL().replace('data:image/png;base64,', '');
                valueContainer.val(data)
            };
            imgObj.src = element.toDataURL()
        } else {
            valueContainer.val(data)
        }
    }
    var updateSort = function updateSort(event, ui) {
        document.getElementById('custAction').value = ui.item.parent().data('pageindex') + '_' + ui.item.data('index') + '_' + ui.item.index();
        setTimeout(function() {
            wiz.doAjaxPost($('#changeSortUrl').val())
        })
    };
    var updateSortRow = function updateSortRow(event, ui) {
        var moveToIndex = ui.item.index();
        if (moveToIndex !== 0) {
            if (ui.item.parent().children()[moveToIndex - 1].getAttribute('data-index') > ui.item.data('index')) {
                moveToIndex = ui.item.parent().children()[moveToIndex - 1].getAttribute('data-index')
            } else {
                if (ui.item.parent().children()[moveToIndex + 1].getAttribute('class') != 'lsrepeat-spacer') {
                    moveToIndex = ui.item.parent().children()[moveToIndex + 1].getAttribute('data-index')
                } else {
                    moveToIndex = ui.item.parent().children()[moveToIndex + 2].getAttribute('data-index')
                }
            }
        }
        document.getElementById('custAction').value = ui.item.parent().data('objectid') + '_' + ui.item.parent().data('repeatpath') + '_' + ui.item.data('index') + '_' + moveToIndex + '_' + ui.item.parent().data('fragmentguid');
        setTimeout(function() {
            wiz.doAjaxPost($('#changeSortUrl').val())
        })
    };
    var addHistory = function addHistory() {
        var currentPage = $('#hidCurrentPage').val(),
            currentRepeat = $('#hidCurrentRepeat').val();
        if (previousPage != currentPage || previousRepeat != currentRepeat) {
            previousPage = currentPage;
            previousRepeat = currentRepeat;
            if (window.History) {
                History.pushState({
                    p: currentPage,
                    r: currentRepeat
                }, null, null)
            }
        }
        return true
    };
    this.commentsPopup = function(sender, qid) {
        var iframe = $('<iframe width="100%" height="450px" frameborder="0" />');
        $('.modal-lgd-insert').html('').append(iframe);
        $('#popupLargeDraggableModal').modal({
            keyboard: false
        });
        $('#draggableDialog').draggable();
        setIframeSource(iframe, $(sender).data('path') + 'wizard/commentsPopupWindow/' + $(sender).data('questionguid') + '?LogGuid=' + $(sender).data('log') + '&FragmentGuid=' + $(sender).data('frag') + '&RepeatPath=' + $(sender).data('repeatpath') + '&Qid=' + qid + '&UserGuid=' + $(sender).data('userguid'));
        $('#up').attr("aria-hidden", "true");
        $('#popupLargeDraggableModal').modal('show')
    };
    this.zoomIn = function(sender, qid) {
        var iframe = $('<iframe id="zoomInFrame" width="' + ((window.innerWidth * .965) - 8) + 'px" height="' + ((window.innerHeight * .97) - 8) + 'px" scrolling="no" style="overflow:hidden" frameborder="0" padding="0" />');
        $('.modal-lgf-insert').html('').append(iframe);
        $('#popupFullscreenModal').modal({
            keyboard: false
        });
        setIframeSource(iframe, $(sender).data('path') + 'wizard/zoomedInInkWindow/' + $(sender).data('questionguid') + '?LogGuid=' + $(sender).data('log') + '&FragmentGuid=' + $(sender).data('frag') + '&RepeatPath=' + $(sender).data('repeatpath') + '&Qid=' + qid + '&UserGuid=' + $(sender).data('userguid'));
        $('#up').attr("aria-hidden", "true");
        $('#popupFullscreenModal').modal('show')
    };
    this.dataPopup = function(sender, url) {
        var iframe = $('<iframe width="100%" height="450px" frameborder="0" />');
        $('.modal-lg-insert').html('').append(iframe);
        $('#popupLargeModal').modal({
            keyboard: false
        });
        setIframeSource(iframe, url);
        $('#up').attr("aria-hidden", "true");
        $('#popupLargeModal').modal('show')
    };
    this.commentKeep = function(sender, commentId, popup, questionGuid, location) {
        var urlPath = $(sender).data('path') + 'wizard/commentKeep/' + questionGuid + "?LogGuid=" + this.getParameterByName("LogGuid", location) + "&CommentId=" + commentId + "&FragmentGuid=" + this.getParameterByName("FragmentGuid", location) + "&RepeatPath=" + this.getParameterByName("RepeatPath", location);
        if (_this.isNative) {
            NativeFunc("doGetUrl", urlPath, function(response) {
                $(sender).hide();
                $(popup.document).find("#" + $(sender).data("alt-id")).show()
            })
        } else {
            $.ajax({
                type: "GET",
                url: urlPath,
                success: function(json) {
                    $(sender).hide();
                    $(popup.document).find("#" + $(sender).data("alt-id")).show()
                }
            })
        }
    };
    this.commentViewUpdate = function(questionGuid, datapath, location) {
        var uri = datapath + 'wizard/commentViewUpdate/' + questionGuid + "?LogGuid=" + this.getParameterByName("LogGuid", location) + "&FragmentGuid=" + this.getParameterByName("FragmentGuid", location) + "&RepeatPath=" + this.getParameterByName("RepeatPath", location) + "&UserGuid=" + this.getParameterByName("UserGuid", location);
        if (_this.isNative) {
            NativeFunc("doGetUrl", uri, function(response) {})
        } else {
            $.ajax({
                type: "GET",
                url: uri,
                success: function(json) {}
            })
        }
    };
    this.getParameterByName = function(name, location) {
        if (location == null) {
            location = window.location.search
        }
        var regexS = "[\\?&]" + name + "=([^&#]*)",
            regex = new RegExp(regexS),
            results = regex.exec(location);
        if (results == null) {
            return ""
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "))
        }
    };
    var attachHelpText = function attachHelpText() {
        $(".help-question").click(function() {
            var link = $(this);
            wiz.showHelp(link.data('path'), this, link.data('questionguid'), link.data('log'), link.data('frag'), link.data('repeatpath'), true);
            return false
        }).mouseover(function() {
            var link = $(this);
            wiz.delayShowHelp(link.data('path'), this, link.data('questionguid'), link.data('log'), link.data('frag'), link.data('repeatpath'))
        }).mouseout(function() {
            wiz.cancelHelp()
        });
        $(".help-object").click(function() {
            var link = $(this);
            wiz.showObjectHelp(link.data('path'), this, link.data('objectid'), link.data('log'), true);
            return false
        }).mouseover(function() {
            var link = $(this);
            wiz.delayShowObjectHelp(link.data('path'), this, link.data('objectid'), link.data('log'))
        }).mouseout(function() {
            wiz.cancelHelp()
        })
    };
    this.keepAlive = function keepAlive(logGuid, timeoutPeriod) {
        if (!this.isNative) {
            logoutTimeoutPeriod = -1;
            setInterval(function() {
                doKeepAlive(logGuid)
            }, timeoutPeriod)
        }
    };
    this.logOut = function logOut(timeoutPeriod) {
        logoutTimeoutPeriod = timeoutPeriod;
        logoutTimerIdentifier = setTimeout(doLogOut, logoutTimeoutPeriod)
    };
    this.liveRefresh = function liveRefresh(timeoutPeriod) {
        liveRefreshPeriod = timeoutPeriod;
        liveRefreshTimerIdentifier = setTimeout(doLiveRefresh, timeoutPeriod)
    };
    this.showHelp = function showHelp(path, id, questionGuid, logGuid, fragmentGuid, repeatPath, showClose) {
        helpButton = id;
        var url = path + 'wizardSupport/getHelpText?logGuid=' + logGuid + '&fragmentGuid=' + fragmentGuid + '&questionGuid=' + questionGuid + '&repeatPath=' + repeatPath;
        if (_this.isNative) {
            NativeFunc("doGetUrl", url, function(response) {
                showHelpResult(response)
            })
        } else {
            $.ajax({
                url: url,
                success: function(msg) {
                    showHelpResult(msg, showClose)
                }
            })
        }
    };
    this.showObjectHelp = function showObjectHelp(path, id, objectId, logGuid, showClose) {
        helpButton = id;
        var url = path + 'wizardSupport/getObjectHelpText?logGuid=' + logGuid + '&objectId=' + objectId;
        if (_this.isNative) {
            NativeFunc("doGetUrl", url, function(response) {
                showHelpResult(response)
            })
        } else {
            $.ajax({
                url: url,
                success: function(msg) {
                    showHelpResult(msg, showClose)
                }
            })
        }
    };
    this.delayShowHelp = function delayShowHelp(path, id, questionGuid, logGuid, fragmentGuid, repeatPath) {
        hoverTimerIdentifier = window.setTimeout(function() {
            if (!$('#closeHelp').is(':visible')) {
                wiz.showHelp(path, id, questionGuid, logGuid, fragmentGuid, repeatPath, false)
            }
        }, 800)
    };
    this.delayShowObjectHelp = function delayShowObjectHelp(path, id, objectId, logGuid) {
        hoverTimerIdentifier = window.setTimeout(function() {
            if (!$('#closeHelp').is(':visible')) {
                wiz.showObjectHelp(path, id, objectId, logGuid, false)
            }
        }, 800)
    };
    this.hideHelp = function hideHelp() {
        $('#HelpText').hide();
        if (helpButton !== null) {
            $(helpButton).focus();
            helpButton = null
        }
    };
    this.cancelHelp = function cancelHelp() {
        window.clearTimeout(hoverTimerIdentifier);
        hoverTimerIdentifier = null;
        if (!$('#closeHelp').is(':visible')) {
            _this.hideHelp()
        }
    };
    this.getAddress = function getAddress(path, lst, prefix) {
        $.ajax({
            type: 'POST',
            url: path + 'WizardSupport/GetAddress',
            data: "{'addressId': '" + $('#' + lst).val() + "'}",
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(json) {
                document.getElementById(prefix + 'chkAddressSave').checked = false;
                document.getElementById(prefix + 'chkAddressSave').disabled = true;
                document.getElementById(prefix + 'rdoExistingAddress').checked = true;
                document.getElementById(prefix + 'Prefix').value = json.Prefix;
                document.getElementById(prefix + 'FirstName').value = json.FirstName;
                document.getElementById(prefix + 'LastName').value = json.LastName;
                document.getElementById(prefix + 'Title').value = json.Title;
                document.getElementById(prefix + 'Organisation').value = json.Organisation;
                document.getElementById(prefix + 'PhoneNumber').value = json.PhoneNumber;
                document.getElementById(prefix + 'FaxNumber').value = json.FaxNumber;
                document.getElementById(prefix + 'EmailAddress').value = json.EmailAddress;
                document.getElementById(prefix + 'StreetAddress1').value = json.StreetAddress.Address1;
                document.getElementById(prefix + 'StreetAddress2').value = json.StreetAddress.Address2;
                document.getElementById(prefix + 'StreetSuburb').value = json.StreetAddress.Suburb;
                document.getElementById(prefix + 'StreetState').value = json.StreetAddress.State;
                document.getElementById(prefix + 'StreetPostCode').value = json.StreetAddress.Postcode;
                document.getElementById(prefix + 'StreetCountry').value = json.StreetAddress.Country;
                document.getElementById(prefix + 'PostalAddress1').value = json.PostalAddress.Address1;
                document.getElementById(prefix + 'PostalAddress2').value = json.PostalAddress.Address2;
                document.getElementById(prefix + 'PostalSuburb').value = json.PostalAddress.Suburb;
                document.getElementById(prefix + 'PostalState').value = json.PostalAddress.State;
                document.getElementById(prefix + 'PostalPostCode').value = json.PostalAddress.Postcode;
                document.getElementById(prefix + 'PostalCountry').value = json.PostalAddress.Country;
                $('[id^=\"' + prefix + 'C\"]').each(function(i) {
                    var found = false,
                        field;
                    for (var f in json.CustomFields) {
                        if (json.CustomFields.hasOwnProperty(f)) {
                            field = json.CustomFields[f];
                            if (field.CustomFieldId == $(this).data('id')) {
                                found = true;
                                try {
                                    if (this.src && this.src != 'undefined' && this.src !== '') {
                                        this.src = this.src.substring(0, this.src.lastIndexOf('DataGuid=')) + 'DataGuid=' + field.Value
                                    } else {
                                        this.value = field.Value
                                    }
                                } catch (ignore) {}
                            }
                        }
                    }
                    if (!found) {
                        if (this.src && this.src != 'undefined' && this.src !== '') {
                            this.src = this.src.substring(0, this.src.lastIndexOf('DataGuid=')) + 'DataGuid='
                        } else if ($(this).prop('id').indexOf('hidCustomFieldID') === -1) {
                            this.value = ''
                        }
                    }
                })
            }
        })
    };
    this.clearAddress = function clearAddress(prefix) {
        if (document.getElementById(prefix + 'chkAddressSave').disabled === true) {
            document.getElementById(prefix + 'chkAddressSave').disabled = false;
            document.getElementById(prefix + 'Prefix').value = '';
            document.getElementById(prefix + 'FirstName').value = '';
            document.getElementById(prefix + 'LastName').value = '';
            document.getElementById(prefix + 'Title').value = '';
            document.getElementById(prefix + 'Organisation').value = '';
            document.getElementById(prefix + 'PhoneNumber').value = '';
            document.getElementById(prefix + 'FaxNumber').value = '';
            document.getElementById(prefix + 'EmailAddress').value = '';
            document.getElementById(prefix + 'StreetAddress1').value = '';
            document.getElementById(prefix + 'StreetAddress2').value = '';
            document.getElementById(prefix + 'StreetSuburb').value = '';
            document.getElementById(prefix + 'StreetState').value = '';
            document.getElementById(prefix + 'StreetPostCode').value = '';
            document.getElementById(prefix + 'StreetCountry').value = '';
            document.getElementById(prefix + 'PostalAddress1').value = '';
            document.getElementById(prefix + 'PostalAddress2').value = '';
            document.getElementById(prefix + 'PostalSuburb').value = '';
            document.getElementById(prefix + 'PostalState').value = '';
            document.getElementById(prefix + 'PostalPostCode').value = '';
            document.getElementById(prefix + 'PostalCountry').value = '';
            $('[id^=\"' + prefix + 'C\"]').each(function() {
                if ($(this).is('img')) {
                    var src = $(this).prop('src');
                    $(this).prop('src', src.substring(0, src.lastIndexOf('DataGuid=')) + 'DataGuid=')
                } else if ($(this).prop('id').indexOf('hidCustomFieldID') === -1) {
                    $(this).val('')
                }
            })
        }
    };
    this.tabClick = function tabClick(ui, tab) {
        document.getElementById('custAction').value = ui.parent().data('objectid') + '_' + ui.parent().data('repeatpath') + '_' + tab + '_' + ui.parent().data('fragmentguid');
        _this.doAjaxPost($('#selectTabUrl').val())
    };
    this.reload = function reload(restoreFocusTo) {
        if (_this.isCapturingData) {
            window.clearInterval(_this.intervalId);
            _this.intervalId = '';
            _this.removeDataCaptureListeners()
        }
        _this.doAjaxPost($('#reloadPageUrl').val(), null, null, restoreFocusTo)
    };
    this.setQuestions = function setQuestions(html) {
        $("#Questions").html(html)
    };
    this.saveProgressDialog = function saveProgressDialog(description) {
        document.getElementById('hidSaveDescription').value = description;
        var url = $('#saveActionUrl').val() + addLatLonQueryString();
        _this.closeModal();
        _this.doAjaxPost(url)
    };
    this.reassignDialog = function reassignDialog(email, name, description) {
        document.getElementById('hidReassignEmail').value = email;
        document.getElementById('hidReassignName').value = name;
        document.getElementById('hidSaveDescription').value = description;
        var url = $('#tempUserReassignUrl').val() + addLatLonQueryString();
        _this.closeModal();
        _this.doAjaxPost(url)
    };
    this.openSave = function openSave(path, logGuid, width) {
        if (width === 0 || width > 380) {
            width = 380
        }
        if (document.getElementById('hidSavedInProgress').value === '00000000-0000-0000-0000-000000000000' || document.getElementById('hidHasManualSaved').value === "0") {
            var iframe = $('<iframe width="' + width + 'px" height="135px" frameborder="0" title="' + $('#savePopupTitle').val() + '"/>');
            $('.modal-insert').html('').append(iframe);
            $('#popupModal').modal({
                keyboard: false
            });
            setIframeSource(iframe, path + 'wizardSupport/savePrompt?LogGuid=' + logGuid + addLatLonQueryString());
            this.showingModal()
        } else {
            saveProgress('')
        }
    };
    this.openTempUserSave = function openTempUserSave(path, logGuid, width) {
        if (width === 0 || width > 380) {
            width = 380
        }
        var iframe = $('<iframe width="' + width + 'px" height="200px" style="padding-top:15px;" frameborder="0" title="' + $('#savePopupTitle').val() + '"/>');
        $('.modal-insert').html('').append(iframe);
        $('#popupModal').modal({
            keyboard: false
        });
        setIframeSource(iframe, path + 'WizardSupport/TempUserSavePrompt?LogGuid=' + logGuid + addLatLonQueryString());
        this.showingModal()
    };
    this.openReassign = function openReassign(path, queryString, width) {
        if (width === 0 || width > 380) {
            width = 380
        }
        var iframe = $('<iframe width="' + width + 'px" height="300px" frameborder="0" title="' + $('#reassignPopupTitle').val() + '"/>');
        $('.modal-insert').html('').append(iframe);
        $('#popupModal').modal({
            keyboard: false
        });
        var url = path + 'WizardSupport/TempUserReassignPrompt?' + addLatLonQueryString();
        if (queryString !== null && queryString !== "") {
            url += '&' + queryString
        }
        setIframeSource(iframe, url);
        this.showingModal()
    };

    function addLatLonQueryString() {
        var latitude = document.getElementById('Latitude').value;
        if (latitude === null || latitude === "") {
            try {
                var doc = parent.document;
                if (doc) {
                    latitude = doc.getElementById('Latitude').value
                }
            } catch (e) {}
        }
        var longitude = document.getElementById('Longitude').value;
        if (longitude === null || longitude === "") {
            try {
                var doc1 = parent.document;
                if (doc1) {
                    longitude = doc1.getElementById('Longitude').value
                }
            } catch (e) {}
        }
        return '&latitude=' + latitude + '&longitude=' + longitude
    }
    this.openPreview = function openPreview(path, logGuid, queryString) {
        var popup = window.open(path + 'Blank.htm', '', 'scrollbars=1,height=300,width=400');
        var url = path + 'wizardsupport/Preview?logGuid=' + logGuid;
        if (queryString !== null && queryString !== "") {
            url += '&' + queryString
        }
        postUpdateCall = function() {
            popup.location = url
        };
        _this.reload()
    };
    this.jumpToGroup = function jumpToGroup(group, repeatIndex) {
        _this.formIsDirty = true;
        _this.pushingState = true;
        document.getElementById('hidNextGroup').value = group;
        document.getElementById('hidNextRepeatIndex').value = repeatIndex;
        _this.reload()
    };
    this.goToPage = function goToPage(pageGuid) {
        _this.formIsDirty = true;
        _this.pushingState = true;
        document.getElementById('hidNextGroup').value = pageGuid;
        document.getElementById('hidNextRepeatIndex').value = '0';
        _this.reload()
    };
    this.goToProject = function goToProject(path, projectGroupGuid, portal, portalSave, wizardMode) {
        _this.clearDirtyState();
        window.location = path + 'home/goToProject?projectGroupGuid=' + projectGroupGuid + "&logguid=" + $('#hidLogGuid').val() + "&portal=" + portal + "&portalSave=" + portalSave + "&wizardMode=" + wizardMode
    };
    this.runActionButton = function runActionSet(fragmentId, questionId, repeatPath, qid) {
        document.getElementById('custAction').value = fragmentId + '_' + questionId + '_' + repeatPath + '_' + $('#hidLogGuid').val();
        _this.doAjaxPost($('#runActionsUrl').val(), null, null, qid)
    };
    this.goToAction = function goToAction(path, link) {
        if (_this.isNative && (link.indexOf("Home/Unlock") === 0 || link.indexOf("Home/Reassign") === 0 || link.indexOf("&group=true") !== -1)) {
            NativeFunc("doAction", path + link, function(response) {})
        } else {
            _this.clearDirtyState();
            window.location = path + link;
            addHistory()
        }
    };
    this.goToLink = function goToLink(path) {
        if (_this.isNative) {
            NativeFunc("doGoToLink", path, function(response) {})
        } else {
            window.location = path
        }
    };
    this.openLink = function openLink(path) {
        if (this.isNative) {
            NativeFunc("doOpenLink", path, function(response) {})
        } else {
            window.open(path)
        }
    };
    this.doAction = function doAction(message, path, link) {
        if (confirm(message)) {
            if (this.isNative) {
                NativeFunc("doAction", path + link, function(response) {})
            } else {
                _this.clearDirtyState();
                document.getElementById('actionForm').setAttribute('action', path + link);
                document.getElementById('actionForm').submit();
                addHistory()
            }
        }
        return false
    };
    this.getTileBorderColour = function getTileBorderColour(elementId) {
        var element = document.getElementById(elementId);
        var colour = $(element).css('border-color');
        return this.rgbToHex(colour)
    };
    this.getTileBackgroundColour = function getTileBackgroundColour(elementId) {
        var element = document.getElementById(elementId);
        var colour = $(element).css('background-color');
        return this.rgbToHex(colour)
    };
    this.getTileBackgroundGradientColour = function getTileBackgroundGradientColour(elementId) {
        var element = document.getElementById(elementId);
        var colours = $(element).css('background-image');
        var gradient = "";
        if (colours.split('0%,').length > 1) {
            gradient = colours.split('0%,')[1].replace('100%)', '').trim()
        }
        return this.rgbToHex(gradient)
    };
    this.addValueToTileDictionary = function addValueToTileDictionary(key, value) {
        if (!this.tileDict.hasOwnProperty(key)) {
            this.tileDict[key] = value
        }
    };
    this.getValueFromTileDictionary = function getValueFromTileDictionary(key) {
        if (this.tileDict.hasOwnProperty(key)) {
            return this.tileDict[key]
        }
        return ''
    };
    this.changeTileFocusRing = function changeTileFocusRing(sender, originalBorder, newBorder) {
        if (newBorder !== '') {
            if (this.rgbToHex(sender.style.borderColor) === this.rgbToHex(originalBorder) || sender.style.borderColor === "") {
                sender.style.borderColor = newBorder
            } else {
                sender.style.borderColor = originalBorder
            }
        }
    };
    this.toggleTileBackground = function toggleTileBackground(sender, originalColour, originalColourDark, newColour, newColourDark) {
        var toggledOn = false;
        var colour = this.rgbToHex(originalColour);
        var colourDark = this.rgbToHex(originalColourDark);
        if (this.rgbToHex(sender.style.backgroundColor) === colour || colour === "" || sender.style.backgroundColor === "") {
            colour = this.rgbToHex(newColour);
            colourDark = this.rgbToHex(newColourDark);
            toggledOn = true
        }
        sender.style.backgroundColor = colour;
        sender.style.backgroundImage = "linear-gradient(to bottom," + colour + " 0%," + colourDark + " 100%)";
        return toggledOn
    };
    this.getStyleBySelector = function getStyleBySelector(selector) {
        var sheetList = document.styleSheets;
        var ruleList;
        var i, j;
        for (i = sheetList.length - 1; i >= 0; i--) {
            ruleList = sheetList[i].cssRules;
            for (j = 0; j < ruleList.length; j++) {
                if (ruleList[j].type == CSSRule.STYLE_RULE && ruleList[j].selectorText == selector) {
                    return ruleList[j].style
                }
            }
        }
        return null
    };
    this.rgbToHex = function rgbToHex(colour) {
        if (colour.charAt(0) === "#" || colour === '') {
            colour = colour.toUpperCase();
            if (colour.length === 3) {
                colour = "#0000" + colour.substring(1)
            } else if (colour.length === 5) {
                colour = "#00" + colour.substring(1)
            }
            return colour
        }
        var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(colour),
            r = parseInt(nums[2], 10).toString(16),
            g = parseInt(nums[3], 10).toString(16),
            b = parseInt(nums[4], 10).toString(16);
        return "#" + ((r.length === 1 ? "0" + r : r) + (g.length === 1 ? "0" + g : g) + (b.length === 1 ? "0" + b : b)).toUpperCase()
    };
    this.openUploadPage = function openUploadPage(path, fragmentGuid, questionId, uploadType, repeatPath, logGuid, qid) {
        path = path + 'wizardSupport/selectFile?FragmentGuid=' + fragmentGuid + '&QuestionId=' + questionId + '&UploadType=' + uploadType + '&repeatPath=' + repeatPath + '&logGuid=' + logGuid;
        if (qid != null && uploadType === "ink") {
            path = path + '&qid=' + qid
        }
        if (this.isNative) {
            NativeFunc("doGetUrl", path, function(response) {})
        } else {
            var iframe = $('<iframe width="350px" height="135px" frameborder="0" title="' + $('#uploadPopupTitle').val() + '"/>');
            $('.modal-insert').html('').append(iframe);
            $('#popupModal').modal({
                keyboard: false
            });
            setIframeSource(iframe, path);
            this.showingModal()
        }
    };
    this.openFile = function openFile(anchorHref) {
        if (this.isNative) {
            NativeFunc("doGetUrl", anchorHref, function(response) {});
            return false
        } else {
            return true
        }
    };
    this.contentUploadFinished = function contentUploadFinished() {
        _this.closeModal();
        _this.reload()
    };
    this.clearContent = function clearContent(fragmentId, questionId, repeatPath) {
        document.getElementById('custAction').value = 'clear' + fragmentId + questionId + repeatPath;
        _this.reload()
    };
    this.selectContent = function selectContent(fragmentId, questionId, id, repeatPath) {
        document.getElementById('custAction').value = 'select' + fragmentId + questionId + repeatPath + '_' + id;
        _this.reload()
    };
    this.searchContent = function searchContent(fragmentId, questionId, repeatPath) {
        document.getElementById('custAction').value = 'search' + fragmentId + questionId + repeatPath;
        _this.reload()
    };
    this.previewImage = function previewImage(e, id, path, publishedBy, fragmentGuid, questionId, repeatPath) {
        var je = $.event.fix(e);
        if (_this.isNative) {
            _this.openFile(path + 'wizardSupport/getFragment?Guid=' + id + '&publishedBy=' + publishedBy + '&fragmentGuid=' + fragmentGuid + '&questionId=' + questionId + '&repeatPath=' + repeatPath)
        } else {
            $('#previewWin').html('<img src="' + path + 'wizardSupport/getImage?Thumb=1&Guid=' + id + '&publishedBy=' + publishedBy + '">');
            $('#previewWin').css({
                left: je.pageX,
                top: je.pageY
            });
            $('#previewWin').show()
        }
    };
    this.previewClose = function previewClose() {
        $('#previewWin').hide()
    };
    this.delayPostback = function delayPostback() {
        if (!_this.overridePostback) {
            //timerIdentifier = setTimeout(_this.reload, 100)
        }
    };
    this.pageChanged = function pageChanged() {
        var REPEAT_PAGE_HEADING = -2,
            NORMAL_PAGE = -1,
            css, item, repeatList, isNative = _this.isNative,
            attr;
        if (_this.stateCustomUI !== null && _this.stateCustomUI !== '') {
            var customUIDiv = $('#plhCustomUI');
            if (customUIDiv.length > 0) {
                customUIDiv.html(_this.stateCustomUI)
            }
        }
        if (_this.pageListJson.length === 0 && $("#NativeButtons").length === 0) {
            if ($('.ix-nav-portal').length > 0) {
                $('.ix-nav-portal').hide()
            }
            $('#ix-pagenavbtn').hide();
            $('#Sections').hide();
            $('#Questions').addClass('noNavPane')
        } else {
            var pageList = $('#pagesList'),
                addList = pageList;
            if (pageList.length > 0) {
                var pageUl = $('<ul class="nav">');
                pageList.html('');
                pageList.append(pageUl);
                pageList = pageUl;
                for (var i = 0; i < _this.pageListJson.length; i++) {
                    item = _this.pageListJson[i];
                    attr = '';
                    if (!_this.hasValidationChanged) {
                        for (var prevI = 0; prevI < previousPageListJson.length; prevI++) {
                            if (previousPageListJson[prevI].Index == item.Index && previousPageListJson[prevI].RepeatIndex == item.RepeatIndex) {
                                item.IsValid = previousPageListJson[prevI].IsValid;
                                break
                            }
                        }
                    }
                    if (item.IsValid || item.IsCurrentPage) {
                        if (item.RepeatIndex == REPEAT_PAGE_HEADING) {
                            css = ''
                        } else if (item.IsCurrentPage) {
                            css = 'active g-complete';
                            attr = ' aria-current="step"'
                        } else if (item.IsVisited) {
                            css = 'g-complete'
                        } else {
                            css = ''
                        }
                    } else {
                        css = 'g-complete g-error'
                    } if (item.RepeatIndex == REPEAT_PAGE_HEADING) {
                        repeatList = '';
                        pageList.append($('<li class="' + css + '"><a href="#void" style="cursor:default"' + attr + '>' + item.Name + '</a></li>'));
                        if (item.IsSortable && !isNative) {
                            repeatList = $('<ul class="nav sortable touchable" data-pageIndex="' + item.Index + '"></ul>')
                        } else {
                            repeatList = $('<ul class="nav" data-pageIndex="' + item.Index + '"></ul>')
                        }
                        pageList.append(repeatList);
                        addList = repeatList
                    } else if (item.RepeatIndex == NORMAL_PAGE) {
                        addList = pageList;
                        addList.append($('<li class="' + css + '"><a href="#void" onclick="wiz.jumpToGroup(' + item.Index + ', -1);return false;"' + attr + '>' + item.Name + '</a></li>'))
                    } else {
                        addList.append($('<li class="' + css + '" data-index="' + item.RepeatIndex + '">' + (item.IsSortable && !isNative ? '<span class="MoveIcon"><span class="sr-only">Move Page</span></span>' : '') + '<a href="#void" onclick="wiz.jumpToGroup(' + item.Index + ', ' + item.RepeatIndex + ');return false;"' + attr + '><em>&nbsp;&nbsp;&nbsp; ' + item.Name + '</em></a></li>'))
                    }
                }
                $('.sortable').sortable({
                    update: updateSort
                })
            }
        }
        previousPageListJson = _this.pageListJson;
        $('.sortableRow').sortable({
            items: '> tr',
            handle: '.touchable',
            stop: updateSortRow,
            helper: function(e, ui) {
                $(this).find('.tinyMCE').each(function() {
                    var edId = $(this).prop('id');
                    tinyMCE.editors[edId].remove()
                });
                ui.children().each(function() {
                    $(this).width($(this).width())
                });
                return ui
            }
        });
        if (_this.pushingState) {
            addHistory()
        }
        if (postUpdateCall !== null) {
            postUpdateCall();
            postUpdateCall = null
        }
        attachHelpText()
    };
    this.doUserSearch = function doUserSearch(path, groupRestriction, selectString, noPersonFound) {
        $.ajax({
            type: 'POST',
            contentType: 'application/json;charset=utf-8',
            url: path + 'search/users',
            data: '{"group":"' + groupRestriction + '", "first":"' + $('#firstName').val() + '", "last":"' + $('#lastName').val() + '"}',
            dataType: 'json',
            success: function(data) {
                var items = [],
                    hasRows = false;
                $.each(data, function(i, item) {
                    if (!item.IsGuest) {
                        items.push('<tr><td>' + '<a href="#void" onclick="wiz.selectUser(this, \'' + item.Id + '\');return false;" title="' + selectString + '">' + selectString + '</a></td><td>' + item.last + '</td><td>' + item.first + '</td></tr>');
                        hasRows = true
                    }
                });
                if (!hasRows) {
                    items.push('<tr><td class="cell-normal" colspan="3"><span class="wrn" style="display:inline">' + noPersonFound + '</span></td></tr>')
                }
                $('#rowResults').html(items.join(''))
            }
        })
    };
    this.doUsernameSearch = function doUsernameSearch(path, groupRestriction, found, notFound, noValue) {
        if (this.isNative) {
            if ($('#username').val().trim().length === 0) {
                alert(noValue);
                return
            }
            var url = path + 'search/users?username=' + encodeURIComponent($('#username').val()) + '&group=' + encodeURIComponent(groupRestriction);
            NativeFunc("doGetUrl", url, function(response) {
                if (response) {
                    $('#selectedUser').val(response);
                    $('#workflowSearchResponse').html(found)
                } else {
                    $('#workflowSearchResponse').html(notFound)
                }
            })
        }
    };
    this.doGroupSearch = function doGroupSearch(path, found, notFound, noValue) {
        if (this.isNative) {
            if ($('#group').val().trim().length === 0) {
                alert(noValue);
                return
            }
            var url = path + 'search/groups?group=' + encodeURIComponent($('#group').val());
            NativeFunc("doGetUrl", url, function(response) {
                if (response) {
                    $('#selectedGroup').val(response);
                    $('#workflowSearchResponse').html(found)
                } else {
                    $('#workflowSearchResponse').html(notFound)
                }
            })
        }
    };
    this.selectUser = function selectUser(obj, id) {
        var previous = $('#grdResults .active');
        if (previous.length > 0) {
            previous.toggleClass('active')
        }
        $(obj).closest('tr').addClass('active');
        $('#selectedUser').val(id)
    };
    this.setPath = function setPath(fragmentGuid, objectId, repeatPath) {
        $('#hidFragmentGuid').val(fragmentGuid);
        $('#hidObjectId').val(objectId);
        $('#hidRepeatPath').val(repeatPath);
        return true
    };
    this.fireDefaultButton = function fireDefaultButton(event, button) {
        var je = $.event.fix(event);
        switch (je.target.type) {
            case 'button':
                return;
            case 'submit':
                return;
            case 'textarea':
                return;
            case 'select-one':
                return;
            case '':
                return
        }
        if (defaultButtonOverride !== undefined) {
            button = defaultButtonOverride
        }
        if (je.which && je.which == 13) {
            var clickButton = $('#' + button);
            if (clickButton.length > 0) {
                _this.overridePostback = true;
                var change = $('#' + je.target.id + '_change');
                if (change.length > 0) {
                    change.val('1')
                }
                clickButton.click()
            }
            return false
        }
        return true
    };
    this.importComplete = function importComplete(fragmentId, sectionId, repeatPath, maxIndex) {
        document.getElementById('custAction').value = 'import' + fragmentId + sectionId + repeatPath + '_' + maxIndex;
        _this.closeModal();
        _this.reload()
    };
    this.setDefaultButton = function setDefaultButton(button) {
        defaultButtonOverride = button
    };
    this.dataCheckAll = function dataCheckAll(e) {
        var value, chkBox = e.target || e.srcElement,
            isChecked = chkBox.checked,
            grid = $(chkBox).closest('table');
        if (isChecked) {
            value = ''
        } else {
            value = 'None'
        }
        document.getElementById(grid.data('selectionfield')).value = value;
        grid.find('input').prop('checked', isChecked)
    };
    this.dataCheckItem = function dataCheckItem(e, index) {
        var chkBox = e.target || e.srcElement,
            grid = $(chkBox).closest('table'),
            selectionField = $('#' + grid.data('selectionfield')),
            selectedIndices, rowCount;
        if (chkBox.checked) {
            if (selectionField.val() == 'None') {
                selectionField.val(index)
            } else {
                selectionField.val(selectionField.val() + ',' + index)
            }
        } else {
            if (selectionField.val() === '') {
                selectedIndices = []
            } else {
                selectedIndices = selectionField.val().split(',')
            } if (selectedIndices.length === 0) {
                rowCount = grid.find('tr').length;
                for (var i = 0; i < rowCount - 1; i++) {
                    selectedIndices.push(i.toString())
                }
            }
            this.removeAt(selectedIndices, this.indexOf(selectedIndices, index));
            if (selectedIndices.length === 0) {
                selectedIndices.push('None')
            }
            selectionField.val(selectedIndices.join(','))
        }
    };
    this.dataSelectItem = function dataSelectItem(e, index) {
        var aSelect = e.target || e.srcElement,
            grid = $(aSelect).closest('table'),
            selectionField = $('#' + grid.data('selectionfield')),
            row;
        if (selectionField.val() !== '' && parseInt(selectionField.val(), 10) > -1) {
            row = $(grid.find('tr')[parseInt(selectionField.val(), 10) + 1]);
            if (row != null && row.length > 0) {
                row.removeClass('active')
            }
        }
        row = $(aSelect).closest('tr');
        row.addClass('active');
        selectionField.val(index)
    };
    this.dataScrollToView = function dataScrollToView(grid, container) {
        var frameHalfHeight = 90,
            table = document.getElementById(grid),
            groups = table.tBodies,
            selectedRow = null,
            rows;
        for (var i = 0; i < groups.length; i++) {
            rows = groups[i].rows;
            for (var j = 0; j < rows.length; j++) {
                if (rows[j].getAttribute('class') == 'active') {
                    selectedRow = rows[j];
                    break
                }
            }
        }
        if (selectedRow !== null) {
            $('#' + container).scrollTop(selectedRow.offsetTop - frameHalfHeight)
        }
    };
    this.closeModal = function closeModal() {
        $('#up').attr("aria-hidden", "false");
        $('#popupModal').modal('hide');
        var childNodes = $('.modal-insert').children;
        for (var i = 0; i < childNodes.length; i++) {
            $(childNodes[i]).remove()
        };
    };
    this.closeLargeModal = function closeLargeModal() {
        $('#up').attr("aria-hidden", "false");
        $('#popupLargeModal').modal('hide');
        var childNodes = $('.modal-lg-insert').children;
        for (var i = 0; i < childNodes.length; i++) {
            $(childNodes[i]).remove()
        };
    };
    this.closeLargeDraggableModal = function closeLargeDraggableModal() {
        $('#up').attr("aria-hidden", "false");
        $('#popupLargeDraggableModal').modal('hide');
        var childNodes = $('.modal-lgd-insert').children;
        for (var i = 0; i < childNodes.length; i++) {
            $(childNodes[i]).remove()
        };
    };
    this.closeFullscreenModal = function closeFullscreenModal() {
        $('#up').attr("aria-hidden", "false");
        $('#popupFullscreenModal').modal('hide');
        var childNodes = $('.modal-lgf-insert').children;
        for (var i = 0; i < childNodes.length; i++) {
            $(childNodes[i]).remove()
        };
    };
    this.closeWaitDialog = function closeWaitDialog() {
        if ($('#wait-modal').hasClass('in')) {
            $('#wait-modal').modal('hide')
        }
        if ($('#waitShort-modal').hasClass('in')) {
            $('#waitShort-modal').modal('hide')
        }
        $(document).unbind('keydown')
    };
    this.openImportDialog = function openImportDialog(path, fragmentGuid, objectId, repeatPath, logGuid, width) {
        if (width === 0 || width > 380) {
            width = 380
        }
        var iframe = $('<iframe width="' + width + 'px" height="260px" frameborder="0" title="' + $('#importPopupTitle').val() + '"/>');
        $('.modal-insert').html('').append(iframe);
        $('#popupModal').modal({
            keyboard: false
        });
        setIframeSource(iframe, path + 'WizardSupport/ImportRepeatedItems?fragmentGuid=' + fragmentGuid + '&objectid=' + objectId + '&repeatpath=' + repeatPath + '&logGuid=' + logGuid);
        this.showingModal();
        return false
    };
    this.doAjaxPost = function doAjaxPost(url, buttonName, buttonValue, restoreFocusTo, isAsync) {
        if (isAsync == null) {
            isAsync = true
        }
        var postbackForm = $('#aspnetForm'),
            formData;
        beforeSubmit();
        if (restoreFocusTo != null) {
            _this.lastFocusedControlId = restoreFocusTo
        }
        formData = postbackForm.serialize();
        if (buttonName != null) {
            formData += '&' + encodeURIComponent(buttonName) + '=' + encodeURIComponent(buttonValue)
        }
        if (this.isNative) {
            var dataNode = {
                url: url,
                formData: formData
            };
            Native("doAjax", dataNode)
        } else {
            $.ajax({
                type: 'POST',
                url: url,
                data: formData,
                async: isAsync,
                error: function(xhr, status, error) {
                    if (xhr.status == 401) {
                        window.location = $('#logUrl').val()
                    } else {
                        updateError(xhr.responseText)
                    }
                },
                success: function(response, status, xhr) {
                    if (xhr.status == 304) {
                        _this.overridePostback = false;
                        _this.clearWaitTimer();
                        _this.closeWaitDialog()
                    } else if (xhr.getResponseHeader("X-Responded-JSON") != null) {
                        var jsonResponse = JSON.parse(xhr.getResponseHeader("X-Responded-JSON"));
                        if (jsonResponse.status == "401") {
                            window.location = $('#logUrl').val()
                        }
                    } else {
                        updatePlaceholder(response)
                    }
                }
            })
        } if (logoutTimeoutPeriod > 0) {
            logoutTimerIdentifier = setTimeout(doLogOut, logoutTimeoutPeriod)
        }
        if (liveRefreshPeriod > 0) {
            liveRefreshTimerIdentifier = setTimeout(doLiveRefresh, liveRefreshPeriod)
        }
        return false
    };
    this.onAjaxSuccess = function onAjaxSuccess(response) {
        updatePlaceholder(response)
    };
    this.clearWaitTimer = function clearWaitTimer() {
        clearTimeout(waitTimerIdentifier)
    };
    this.waitDialogTimerExpired = function waitDialogTimerExpired() {
        $('#wait-modal').modal({
            backdrop: 'static',
            keyboard: false
        });
        return false
    };
    this.renderInkCanvas = function renderInkCanvas(id, backgroundBase64, foregroundBase64, colour, canvasWidth, canvasHeight, zoomedIn, dataFocus) {
        var cv = $('#' + id + 'cv'),
            imgBk, img;
        if (zoomedIn) {
            canvasHeight = window.innerHeight - 58;
            canvasWidth = window.innerWidth - 8;
            var header = $("div.question-text");
            header.hide();
            var sideHeader = $("div.qtdiv");
            var td = sideHeader.closest('td');
            td.remove()
        }
        if (backgroundBase64 !== null) {
            imgBk = new Image;
            imgBk.onload = function() {
                var imgH = imgBk.height;
                $('#' + id).data('bk-height', imgH);
                var imgW = imgBk.width;
                $('#' + id).data('bk-width', imgW);
                var dispH = imgH;
                var dispW = imgW;
                if (canvasHeight > 0 || canvasWidth > 0) {
                    var imageRatio = imgH / imgW;
                    var canvas = resizeImgCanvas(canvasHeight, canvasWidth, dispH, dispW, imageRatio);
                    if (canvas.resized) {
                        dispH = canvas.height;
                        dispW = canvas.width
                    }
                }
                updateInkStyles(dispW, dispH, zoomedIn, id);
                var cvBk = $('#' + id + 'cvbk');
                cvBk[0].getContext('2d').drawImage(imgBk, 0, 0, dispW, dispH)
            };
            imgBk.src = 'data:image/png;base64,' + backgroundBase64
        } else if (foregroundBase64 === null) {
            $('#' + id + 'wrap').width(cv.width()).height(cv.height());
            $('#' + id + 'scrollwrap').height(cv.height() + 14)
        }
        if (foregroundBase64 !== null) {
            img = new Image;
            img.onload = function() {
                var cvWidth = cv.width();
                var scaleRatio = 1;
                var imageWidth = img.width;
                var imageHeight = img.height;
                if (backgroundBase64 !== null) {
                    imageWidth = imgBk.width;
                    imageHeight = imgBk.height;
                    if (canvasHeight > 0 || canvasWidth > 0) {
                        var imageRatioBk = imgBk.height / imgBk.width;
                        var canvasBk = resizeImgCanvas(canvasHeight, canvasWidth, imgBk.height, imgBk.width, imageRatioBk);
                        if (canvasBk.resized) {
                            scaleRatio = canvasBk.width / imgBk.width
                        }
                    }
                } else if (imageWidth < cvWidth) {
                    updateInkStyles(imageWidth, imageHeight, zoomedIn, id)
                } else if (imageWidth > cvWidth) {
                    $('#' + id + 'wrap').width(cv.width()).height(cv.height());
                    $('#' + id + 'scrollwrap').height(cv.height() + 14);
                    scaleRatio = cvWidth / imageWidth
                }
                var ctx = cv[0].getContext("2d");
                if (scaleRatio === 1) {
                    ctx.drawImage(img, 0, 0)
                } else {
                    ctx.drawImage(img, 0, 0, imageWidth * scaleRatio, imageHeight * scaleRatio)
                }
            };
            img.src = 'data:image/png;base64,' + foregroundBase64
        }
        cv.on("mouseleave touchend", function() {
            setInkValue(cv[0])
        });
        cv.on("mouseup touchend", function() {
            if (_this.isCapturingData) {
                _this.dataAnalyticsFocusAndBlur(dataFocus)
            }
        })
    };
    this.loadInk = function loadInk(id, backgroundBase64, foregroundBase64, colour, canvasWidth, canvasHeight, zoomedIn, dataFocus) {
        var waitTime = 0;
        if (zoomedIn) {
            waitTime = 500
        }
        window.setTimeout(function() {
            _this.renderInkCanvas(id, backgroundBase64, foregroundBase64, colour, canvasWidth, canvasHeight, zoomedIn, dataFocus)
        }, waitTime)
    };

    function updateInkStyles(dispW, dispH, zoomedIn, id) {
        var cvBk = $('#' + id + 'cvbk');
        var cv = $('#' + id + 'cv');
        var wrap = $('#' + id + 'wrap');
        wrap.prop('width', dispW).prop('height', dispH);
        cvBk.prop('width', dispW).prop('height', dispH);
        cv.prop('width', dispW).prop('height', dispH);
        if (zoomedIn) {
            $('#' + id + 'scrollwrap').css({
                height: (dispH * 1 + 14),
                width: (dispW * 1 + 14),
                margin: "0 auto"
            })
        } else {
            $('#' + id + 'scrollwrap').height(dispH * 1 + 14)
        } if (zoomedIn) {
            $("#contentinner").css("display", "block")
        }
    }

    function resizeImgCanvas(maxHeight, maxWidth, imageHeight, imageWidth, imageRatio) {
        var resized = false;
        if (maxHeight === 0 && maxWidth > 0 && imageWidth > maxWidth) {
            imageWidth = maxWidth;
            imageHeight = imageRatio * imageWidth;
            resized = true
        }
        if (maxWidth === 0 && maxHeight > 0 && imageHeight > maxHeight) {
            imageHeight = maxHeight;
            imageWidth = imageHeight / imageRatio;
            resized = true
        }
        if ((maxWidth > 0 && imageWidth > maxWidth) || (maxHeight > 0 && imageHeight > maxHeight)) {
            imageHeight = maxHeight;
            imageWidth = imageHeight / imageRatio;
            if (imageWidth > maxWidth) {
                imageWidth = maxWidth;
                imageHeight = imageRatio * imageWidth
            }
            resized = true
        }
        return {
            resized: resized,
            width: imageWidth,
            height: imageHeight
        }
    }
    this.clearInk = function clearInk(id) {
        var canvas = $('#' + id + 'cv')[0],
            ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        $('#' + id).val('')
    };
    this.eraseInk = function clearInk(id) {
        var canvas = $('#' + id + 'cv')[0],
            ctx = canvas.getContext('2d');
        if (ctx.globalCompositeOperation === "destination-out") {
            ctx.globalCompositeOperation = "source-over";
            $('#' + id + 'btn').removeClass("active")
        } else {
            ctx.globalCompositeOperation = "destination-out";
            $('#' + id + 'btn').addClass("active")
        }
    };
    this.setInkColor = function setInkColor(id, colour, signaturePad) {
        var canvas = $('#' + id + 'cv')[0],
            ctx = canvas.getContext('2d');
        ctx.fillStyle = colour;
        signaturePad.penColor = colour
    };
    this.wireTextChanged = function wireTextChanged(textId, changeId, clearDefault) {
        $(textId).on('change', function() {
            $(changeId).val('1')
        });
        if (clearDefault !== '') {
            $(textId).on('keydown', function(e) {
                var code = e.keyCode || e.which;
                if (code != '9' && code != '16' && code != '13') {
                    if ($(textId).val() == clearDefault) {
                        $(textId).val('')
                    }
                }
            })
        }
    };
    this.dateIntervalBlur = function dateIntervalBlur(qid, intervalOrder, isParent, isMandatory, interval) {
        var input = '';
        var selector = '#' + qid;
        if (interval === 'yyyy') {
            validate.intervalFormat(qid, intervalOrder, interval, true)
        }
        var year = $(selector + '_yyyy').val();
        var month = $(selector + '_MM').val();
        var day = $(selector + '_dd').val();
        if (year !== '') {
            input = year + '--'
        }
        if (month !== '') {
            var m = ("0" + month);
            month = m.substr(m.length - 2);
            input = year + '-' + month + '-'
        }
        if (day !== '') {
            var d = ("0" + day);
            day = d.substr(d.length - 2);
            input = year + '-' + month + '-' + day
        }
        if ($(selector).val() !== input) {
            $(selector).val(input);
            var validationPass = validate.dateIntervalValidate(qid, interval, intervalOrder, isMandatory, year, month, day);
            if (isParent) {
                $(selector + '_change').val('1');
                if (validationPass) {
                    this.delayPostback()
                }
            }
        } else if (isMandatory) {
            validate.dateIntervalValidate(qid, interval, intervalOrder, isMandatory, year, month, day)
        }
    };
    this.updateLocation = function(latitude, longitude, latitudeId, longitudeId, onchangeCallback, errorId) {
        $('#' + latitudeId).val(latitude);
        $('#' + longitudeId).val(longitude);
        $('#' + errorId).hide();
        if (latitude * 1 === 0 && longitude * 1 === 0) {
            $('#' + errorId).show()
        }
        if (onchangeCallback && typeof onchangeCallback === 'function') {
            onchangeCallback()
        } else if (onchangeCallback === "true") {
            $('#' + latitudeId).trigger('change')
        }
        $('#' + latitudeId).focus();
        $('#' + longitudeId).focus()
    };
    this.removeCurrencyFormat = function removeCurrencyFormat(value, currencySymbol, decimalSymbol) {
        value = value.replace(currencySymbol, '');
        return value.replace(new RegExp('[^0-9\\-\\' + decimalSymbol + ']+', 'g'), '')
    };
    this.removeFormat = function removeFormat(txt, currencySymbol, decimalSymbol) {
        txt.value = this.removeCurrencyFormat(txt.value, currencySymbol, decimalSymbol)
    };
    this.applyFormat = function applyFormat(path, txt, currencySymbol, decimalSymbol, positivePattern, negativePattern, decimalPlaces) {
        var textValue = this.removeCurrencyFormat(txt.value, currencySymbol, decimalSymbol);
        txt.value = textValue;
        if (textValue !== '') {
            var url = path + 'wizardSupport/formatCurrency?value=' + encodeURIComponent(textValue) + '&symbol=' + encodeURIComponent(currencySymbol) + '&positivePattern=' + encodeURIComponent(positivePattern) + '&negativePattern=' + encodeURIComponent(negativePattern) + '&decimalPlaces=' + encodeURIComponent(decimalPlaces);
            if (_this.isNative) {
                NativeFunc("doGetUrl", url, function(response) {
                    txt.value = response
                })
            } else {
                $.ajax({
                    url: url,
                    success: function(response) {
                        txt.value = response
                    }
                })
            }
        }
    };
    this.initWizard = function initWizard(isNative) {
        this.isNative = isNative;
        if (window.History && History.Adapter) {
            History.Adapter.bind(window, 'statechange', function() {
                var State = History.getState();
                if (!_this.pushingState) {
                    if (State.data != null && State.data.p != null) {
                        document.getElementById('hidNextGroup').value = State.data.p;
                        document.getElementById('hidNextRepeatIndex').value = State.data.r;
                        _this.reload()
                    } else {
                        History.back()
                    }
                }
                _this.pushingState = false
            })
        }
        $(window).on('beforeunload', function(e) {
            _this.unloadSave(true, false);
            if (_this.isCapturingData) {
                _this.dataAnalyticsBlur();
                _this.postDataCapture(true)
            }
            if (_this.formIsDirty) {
                return $('#exitMessage').val()
            }
        });
        $(document).on('hide.bs.dropdown', '.btn-group-multiselect', function() {
            wiz.reload()
        });
        if (isNative) {
            var ua = window.navigator.userAgent;
            var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
            var webkit = !!ua.match(/WebKit/i);
            var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
            if (iOSSafari) {
                $('#lnkHome').on('click', function(e) {
                    if (_this.formIsDirty && !confirm($('#exitMessage').val())) {
                        e.preventDefault()
                    }
                })
            }
        }
    };
    this.bodyClick = function bodyClick() {
        if ($(".navbar-collapse").is(":visible") && $(".navbar-toggle").is(":visible")) {
            $('.navbar-collapse').collapse('toggle')
        }
    };
    this.showingModal = function() {
        $('#up').attr("aria-hidden", "true")
    };
    this.disableWeekends = function disableWeekends(date) {
        var day = date.getDay();
        if (day === 0 || day === 6) {
            return [false]
        }
        return [true]
    };
    this.disableUniversalWeekends = function disableUniversalWeekends(e) {
        var day = new Date(e.target.value).getDay();
        if (day === 0 || day === 6) {
            e.target.setCustomValidity($(e.target).data('valmsg'))
        }
        e.target.setCustomValidity('')
    };
    this.generate = function generate(generateUrl) {
        wiz.clearDirtyState();
        if (this.isNative) {
            Native("doGenerate", "")
        } else {
            window.location = generateUrl
        }
    };
    this.fetchData = function fetchData(qid, url) {
        getWizardUrl(url, function(response) {
            $("#" + qid + "_results").html(response)
        })
    };
    this.clearDirtyState = function clearDirtyState() {
        _this.formIsDirty = false
    };
    this.addScript = function addScript(id, src) {
        var script = document.getElementById(id);
        if (script == null) {
            var dfd = $.Deferred();
            script = document.createElement('script');
            script.loadPromise = dfd;
            script.onload = function() {
                dfd.resolve(script)
            };
            script.src = src;
            script.id = id;
            document.head.appendChild(script)
        }
        return script.loadPromise.promise()
    };
    this.setSyncLogo = function setSyncLogo(logo, syncCount) {
        if (logo === '') {
            $('#syncLogo').hide()
        } else {
            $('#syncLogo').attr("src", logo);
            $('.nav-native-sync').show();
            $('#syncLogo').show()
        } if (syncCount === 0) {
            $("#pendingSyncCount").hide()
        } else {
            $("#pendingSyncCount").text(syncCount);
            $('.nav-native-sync').show();
            $("#pendingSyncCount").show()
        }
    };
    this.unloadSave = function unloadSave(isBackground, goHome) {
        if (!$(document.body).hasClass('projectType-dashboard')) {
            if ($(document.activeElement).is('input')) {
                $("#" + $(document.activeElement)[0].id + "_change").val("1")
            }
            if (_this.isNative) {
                var url = "wizard/saveAnswerFile/autoSave?background=" + isBackground + "&goHome=" + goHome;
                _this.doAjaxPost(url, null, null, null, false)
            } else if ($('#saveActionUrl').length > 0) {
                var url = $('#saveActionUrl').val() + addLatLonQueryString() + "&autoSave=true";
                _this.doAjaxPost(url, null, null, null, false)
            }
        } else if (goHome) {
            return true
        }
        return false
    };
    this.backgroundSync = function backgroundSync() {
        if (_this.isNative) {
            NativeFunc("doBackgroundSync", 'arg', function(response) {})
        }
    };
    this.clearFocus = function clearFocus() {
        _this.lastFocusedControlId = '';
        _this.lastScrollWindowPosition = 0;
        _this.lastScrollGroupPosition = 0
    }
};

function triggerRefresh() {
    'use strict';
    document.getElementById('hidValidate').value = true;
    wiz.delayPostback()
}