var EditController = {
    init: function(parent) {
        var button = $('<a class="button">Save</a>').click(function () {
            var uname = $('#uname').val();
            if (uname != loginTwitter.user.username) {
                PeriscopeWrapper.V2_POST_Api('verifyUsername', {
                    username: uname,
                    display_name: loginTwitter.user.display_name
                }, function () {
                    loginTwitter.user.username = uname;
                    localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
                });
            }
            var description = $('#description').val();
            if (description != loginTwitter.user.description)
                PeriscopeWrapper.V2_POST_Api('updateDescription', {
                    description: description
                }, function () {
                    loginTwitter.user.description = description;
                    localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
                });
            var dname = $('#dname').val();
            if (dname != loginTwitter.user.display_name) {
                PeriscopeWrapper.V2_POST_Api('updateDisplayName', {
                    display_name: dname
                }, function () {
                    loginTwitter.user.display_name = dname;
                    localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
                });
            }
            if ($('input[name="image"]').val())
                form.submit();
        });
        var form = $('<form target="foravatar" action="https://api.periscope.tv/api/v2/uploadProfileImage" enctype="multipart/form-data" method="post">' +
            '<input name="image" type="file" accept="image/jpeg,image/png,image/gif">' +
            '<input name="cookie" type="hidden" value="'+loginTwitter.cookie+'"></form>');
        var hiddenIframe = $('<iframe id="foravatar" name="foravatar" style="display: none;"/>').on('load',PeriscopeWebClient.RefreshProfile(loginTwitter));
    
        var settingsContainer = $('<div/>');
        var tempSettings;
        PeriscopeWrapper.V2_POST_Api('getSettings', {}, function (settingsResponse) {
            loginTwitter.settings = settingsResponse;
            localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
            tempSettings = settingsResponse;
            for (var setting in loginTwitter.settings) {
                settingsContainer.append($('<label><input type="checkbox" ' + (loginTwitter.settings[setting] ? 'checked' : '') + '/> ' + setting + '</label><br/>').click(function (setting) {
                    return function (e) {
                        tempSettings[setting] = e.target.checked;
                    }
                }(setting)));
            }
        });
        var buttonSettings = $('<a class="button">Save</a>').click(function () {
            PeriscopeWrapper.V2_POST_Api('setSettings', {
                settings: tempSettings
            }, function (r) {
                if (r.success){
                    loginTwitter.settings = tempSettings;
                    localStorage.setItem('loginTwitter', JSON.stringify(loginTwitter));
                } else
                    alert('Settings not saved!');
            });
        });
    
        var notifications = $('<label><input type="checkbox" ' + (settings.followingNotifications ? 'checked' : '') + '/> Enable notifications</label>').click(function (e) {
            setSet('followingNotifications', e.target.checked);
            if (e.target.checked)
                Notifications.start();
            else
                Notifications.stop();
        });
        var notifications_interval = $('<input type="number" min="2" value="' + (settings.followingInterval || Notifications.default_interval) + '">').change(function () {
            setSet('followingInterval', this.value);
            Notifications.stop();
            Notifications.start();
        });
    
        if (NODEJS) {
            var autoDownload = $('<label><input type="checkbox" ' + (settings.automaticDownload ? 'checked' : '') + '/> Enable automatic downloading of the following items</label>').click(function (e) {
                setSet('automaticDownload', e.target.checked);
                if (e.target.checked)
                    Notifications.start();
                else
                    Notifications.stop();
            });
            var download_private = $('<label><input type="checkbox" style="margin-left: 1.5em;" ' + (settings.privateDownload ? 'checked' : '') + '/> Private broadcasts</label>').click(function (e) {
                setSet('privateDownload', e.target.checked);
            });
            var download_following = $('<label><input type="checkbox" style="margin-left: 1.5em;"' + (settings.followingDownload ? 'checked' : '') + '/> Following broadcasts</label>').click(function (e) {
                setSet('followingDownload', e.target.checked);
            });
            var download_shared = $('<label><input type="checkbox" style="margin-left: 1.5em;"' + (settings.sharedDownload ? 'checked' : '') + '/> Shared broadcasts</label>').click(function (e) {
                setSet('sharedDownload', e.target.checked);
            });
            var download_Selected = $('<label><input type="checkbox" style="margin-left: 1.5em;"' + (settings.selectedDownload ? 'checked' : '') + '/> Selected users broadcasts</label>').click(function (e) {
                setSet('selectedDownload', e.target.checked);
            });
            var current_download_path = $('<dt style="margin-right: 10px;">' + settings.downloadPath + '</dt>');
            var download_path = $('<dt/>').append($('<input type="file" nwdirectory/>').change(function () {
                setSet('downloadPath', $(this).val());
                current_download_path.text($(this).val());
            }));
            // var download_format = $('<dt/>').append($('<select>' +
            //     '<option value="mp4" '+(settings.downloadFormat=='mp4'?'selected':'')+'>MP4</option>' +
            //     '<option value="ts" '+(settings.downloadFormat=='ts'?'selected':'')+'>TS</option>' +
            //     '</select>').change(function () {
            //     setSet('downloadFormat', $(this).val());
            // }));
            var log_broadcasts_to_file = $('<label><input type="checkbox" ' + (settings.logToFile ? 'checked' : '') + '/> Log broadcasts to a file</label>').click(function (e) {
                setSet('logToFile', e.target.checked);
            });
            var replay_time_limit = $('<input type="number" min="2" value="' + (settings.replayTimeLimit || Notifications.default_replay_limit) + '">').change(function () {
                setSet('replayTimeLimit', this.value);
            });
        }
    
        if (!NODEJS) {
            var show_nodeDown_links = $('<label><input type="checkbox" ' + (settings.showNodeDownLinks ? 'checked' : '') + '/> Show node periscopeDownloader links</label>').click(function (e) {
                setSet('showNodeDownLinks', e.target.checked);
            });
            var show_nodeDown_linksPrv = $('<label><input type="checkbox" style="margin-left: 1.5em;"' + (settings.showNodeDownLinksPrv ? 'checked' : '') + '/> Private broadcasts only</label>').click(function (e) {
                setSet('showNodeDownLinksPrv', e.target.checked);
            });
        }
    
        var show_m3u_links = $('<label><input type="checkbox" ' + (settings.showM3Ulinks ? 'checked' : '') + '/> Show M3U links</label>').click(function (e) {
            setSet('showM3Ulinks', e.target.checked);
        });
        var show_partial_links = $('<label><input type="checkbox" ' + (settings.showPRlinks ? 'checked' : '') + '/> Show partial replay(PR) links</label>').click(function (e) {
            setSet('showPRlinks', e.target.checked);
        });
        var update_thumbnails = $('<label><input type="checkbox" ' + (settings.updateThumbnails ? 'checked' : '') + '/> Auto update thumbnails</label>').click(function (e) {
            setSet('updateThumbnails', e.target.checked);
        });
        var open_preview_in_separate_windows = $('<label><input type="checkbox" ' + (settings.previewSeparateWindows ? 'checked' : '') + '/> Open previews in separate windows</label>').click(function (e) {
            setSet('previewSeparateWindows', e.target.checked);
        });
        var show_selected_users = $('<label><input type="checkbox" ' + (settings.selectedUsersList ? 'checked' : '') + '/> Show selected user add button</label>').click(function (e) {
            setSet('selectedUsersList', e.target.checked);
        });
    
        var fileNameButton = $('<a class="button">Save</a>').click(function () {
            setSet('userPartialShort', $('#partialShort').val());
            setSet('userReplayShort', $('#replayShort').val());
            setSet('userPrivateShort', $('#privateShort').val());
            setSet('userProducerShort', $('#producerShort').val());
            setSet('userFolderName', $('#folderName').val());
            setSet('userFileName', $('#fileName').val());
        });
        var resetToDefault = $('<a class="button">Default</a>').click(function () {
            $('#partialShort').val(DefaultFolderFileNames.partialShort);
            $('#replayShort').val(DefaultFolderFileNames.replayShort);
            $('#privateShort').val(DefaultFolderFileNames.privateShort);
            $('#producerShort').val(DefaultFolderFileNames.producerShort);
            $('#folderName').val(DefaultFolderFileNames.folderName);
            $('#fileName').val(DefaultFolderFileNames.fileName);
        });
    
        var ProfileEditSpoiler = $('<h3 class="spoiler menu"  data-spoiler-link="ProfileEdit">Profile edit</h3>');
        var ProfileEdit = $('<div class="spoiler-content" data-spoiler-link="ProfileEdit" id="ProfileEdit" />')
            .append('<dt>Display name:</dt><input id="dname" type="text" value="' + loginTwitter.user.display_name + '"><br/>' +
                '<dt>Username:</dt><input id="uname" type="text" value="' + loginTwitter.user.username + '"><br/>' +
                '<dt>Description:</dt><input id="description" type="text" value="' + loginTwitter.user.description + '"><br/>' +
                '<dt>Avatar:</dt>', hiddenIframe, form, '<br/><br/>', button
            );
            
        var MyOpSettingsSpoiler = $('<h3 class="spoiler menu" data-spoiler-link="MyOpSettings">My-OpenPeriscope settings</h3>');
        var MyOpSettings = $('<div class="spoiler-content" data-spoiler-link="MyOpSettings" id="MyOpSettings" />')
            .append(notifications , '<br><br>',
                autoDownload, '<br>',
                download_private, '<br>',
                download_following, '<br>',
                download_shared, '<br>',
                download_Selected, '<br><br>',
                'Notifications refresh interval: ', notifications_interval ,' seconds','<br><br>',
                'Limit replay for auto-download: ', replay_time_limit,' seconds','<br>',
                (NODEJS ? ['<dt>Downloads path:</dt>', current_download_path, download_path, '<br><br><br>'] : ''),
                '<br>', log_broadcasts_to_file,
                '<br>', update_thumbnails,
                '<br>', open_preview_in_separate_windows,
                '<br>', show_selected_users,
                '<br>', show_m3u_links,
                '<br>', show_partial_links,
                '<br>', show_nodeDown_links,
                '<br>', show_nodeDown_linksPrv
            );
    
        var NamesEditorSpoiler = $('<h3 class="spoiler menu" data-spoiler-link="NamesEditor">Names editor</h3>');
        var NamesEditor =  $('<div class="spoiler-content" data-spoiler-link="NamesEditor" id="NamesEditor" />')
            .append(
                '<p>#{id}, #{language}, #{status}, #{user_display_name}, #{user_id}, #{username}, #{year}, #{month}, #{day}, #{hour}, #{minute}</p></br>' +
                '<dt>#{partial}:</dt><input id="partialShort" type="text" value="' + (settings.userPartialShort || DefaultFolderFileNames.partialShort) + '"><br/>' +
                '<dt>#{replay}:</dt><input id="replayShort" type="text" value="' + (settings.userReplayShort || DefaultFolderFileNames.replayShort) + '"><br/>' +
                '<dt>#{private}:</dt><input id="privateShort" type="text" value="' + (settings.userPrivateShort || DefaultFolderFileNames.privateShort) + '"><br/>' +
                '<dt>#{producer}:</dt><input id="producerShort" type="text" value="' + (settings.userProducerShort || DefaultFolderFileNames.producerShort) + '"><br/>' +
                '<dt>Folder name:</dt><textarea id="folderName">' + (settings.userFolderName || DefaultFolderFileNames.folderName) + '</textarea><br/>' +
                '<dt>File name:</dt><textarea id="fileName">' + (settings.userFileName || DefaultFolderFileNames.fileName) + '</textarea><br/><br/>',
                fileNameButton , resetToDefault
            );
    
        var PeriSettingsSpoiler = $('<h3 class="spoiler menu"  data-spoiler-link="PeriSettings">Periscope settings</h3>');
        var PeriSettings = $('<div class="spoiler-content" data-spoiler-link="PeriSettings" id="PeriSettings" />').append(settingsContainer, "<br/>", buttonSettings);
    
        var saveSettingsButton = $('<a class="button">Download Settings</a>').click(function () {download_settings();});
    
        parent.append($('<div id="Edit"/>').append(
            ProfileEditSpoiler,  ProfileEdit,
            MyOpSettingsSpoiler, MyOpSettings,
            NamesEditorSpoiler, NamesEditor,
            PeriSettingsSpoiler, PeriSettings
            , saveSettingsButton
        ));
        $(".spoiler").off("click").spoiler({ triggerEvents: true });
        MyOpSettingsSpoiler.click();
    }
}
