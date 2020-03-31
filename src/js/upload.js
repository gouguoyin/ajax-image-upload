;(function($) {
    var pluginName = "ajaxImageUpload",
        defaults   = {
            fileInput: '', // 上传按钮名，即input[type=file]的name值
            ajaxUrl: '', // 请求地址
            imageUrl: [], // 已上传的图片连接
            ajaxData: {}, // 额外数据
            allowZoom: true, // 是否允许缩放
            allowType: ["gif", "jpeg", "jpg", "bmp", "png"],
            maxNum: 5, // 最多允许上传个数
            maxSize: 1, // 允许上传图片的最大尺寸，单位M
            appendMethod: 'before',  // 追加方式
            before: $.noop, // 上传前回调函数
            success: $.noop, // 上传成功时的回调函数
            error: $.noop, // 上传失败时的回调函数
            complete: $.noop // 所有上传完成时的回调函数
        };

    function Plugin(element, options) {
        this.element   = element;
        this.settings  = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name     = pluginName;
        this.complete  = false;
        this.code = 0;
        this.msg  = '';
        this.init();
    }

    Plugin.prototype = {
        init: function() {
            var $self = this,
                $this = $(this.element),
                $imageUrl = $self.settings.imageUrl;

            $self.createSectionBox();

            // 已经存在的图片先展示出来
            if ($imageUrl) {
                for (var $i = 0; $i < $imageUrl.length; $i++) {
                    $self.createImageSection($imageUrl[$i]);
                }
            }

            $this.find("input[type=file]").on('change', function() {
                $self.fileSelect();
            });

        },
        /**
         * 选择文件
         * @returns {boolean}
         */
        fileSelect: function() {
            var $self = this,
                $this = $(this.element),
                $maxNum  = $self.settings.maxNum,
                $maxSize = $self.settings.maxSize,
                $ajaxUrl = $self.settings.ajaxUrl,
                $fileInput = $self.settings.fileInput,
                $before    = $self.settings.before,
                $complete  = $self.settings.complete,
                $uploadInput  = $this.find("input[type=file]"),
                $imageSection = $this.find('.ggy-image-section');

            if (!$ajaxUrl) {
                $self.callError("300", "没有配置ajaxUrl");
                $self.resetFile();
                return false;
            }

            if (!$fileInput) {
                $self.callError("301", "没有配置fileInput");
                $self.resetFile();
                return false;
            }

            if ($before && $before() === false) {
                $self.resetFile();
                return false;
            }

            var $files = $uploadInput[0].files;

            if ($files.length + $imageSection.length > $maxNum) {
                $self.callError("302", "上传图片数目不能超过" + $maxNum + "个");
                $self.resetFile();
                return false;
            }

            for (var $i = 0; $i < $files.length; $i++) {
                var $file = $files[$i];

                if (!$self.isAllowFile($file)) {
                    $self.callError("303", $file.name + " 图片类型不支持");
                    $self.resetFile();
                    break;
                }

                if ($self.getFileSize($file) > $maxSize) {
                    $self.callError("304", '上传图片不能超过' + $maxSize + 'M，当前上传图片的大小为' + $fileSize.toFixed(2) + 'M');
                    $self.resetFile();
                    break;
                }

                $self.createImageSection();
                $self.ajaxUpload($file);
            }

            if ($self.complete === true) {
                $complete();
            }

            $self.resetFile();
        },

        /**
         * 创建容器盒子
         * @returns {*|jQuery|HTMLElement}
         */
        createSectionBox: function() {
            var $self = this,
                $this = $(this.element),
                $fileInput  = $self.settings.fileInput,
                $sectionBox = $("<div class='ggy-section-box'></div>"),
                $uploadSection = $("<section class='ggy-upload-section'></section>"),
                $modalSection  = $("<section class='ggy-modal-section'></section>"),
                $uploadIcon    = $("<i class='ggy-upload-icon'></i>"),
                $uploadInput   = $("<input type='file' name='" + $fileInput + "' class='ggy-upload-input' accept='image/*' multiple='multiple'>");

            $sectionBox.appendTo($this);
            $uploadSection.appendTo($sectionBox);
            $uploadIcon.appendTo($uploadSection);
            $uploadInput.appendTo($uploadSection);
            $modalSection.appendTo($sectionBox);

            $modalSection.on('click', function(event) {
                event.stopPropagation();
                $modalSection.hide();
            });

        },

        /**
         * 创建上传图片容器片段
         * @param $src
         * @returns {*|jQuery|HTMLElement}
         */
        createImageSection: function($src) {
            var $self = this,
                $this = $(this.element),
                $fileInput = $self.settings.fileInput,
                $allowZoom = $self.settings.allowZoom,
                $appendMethod = $self.settings.appendMethod,
                $sectionBox   = $this.find(".ggy-section-box"),
                $uploadSection = $this.find(".ggy-upload-section"),
                $imageSection  = $("<section class='ggy-image-section loading'></section>"),
                $imageShade    = $("<div class='ggy-image-shade'></div>"),
                $hiddenInput   = $("<input type='hidden' name='" + $fileInput + "[]' value='" + $src + "'>"),
                $imageShow     = $("<img class='ggy-image-show shade' src='" + $src + "'/>");

            if ($src) {
                $imageShow = $("<img class='ggy-image-show' src='" + $src + "'/>");
            }

            switch ($appendMethod) {
                case "before":
                    $sectionBox.prepend($imageSection);
                    break;
                case "after":
                    $uploadSection.before($imageSection);
                    break;
            }

            $hiddenInput.appendTo($imageSection);
            $imageShow.appendTo($imageSection);
            $imageShade.appendTo($imageSection);

            $self.createDeleteNode($imageSection);

            if ($src && $allowZoom === true) {
                $self.createZoomNode($imageSection);
            }
        },

        createDeleteNode: function($imageSection) {
            var $this = $(this.element),
                $modalSection = $this.find(".ggy-modal-section"),
                $deleteIcon   = $("<i class='ggy-delete-icon'></i>"),
                $deleteBox    = $("<div class='ggy-modal-box ggy-delete-box'><p class='ggy-delete-tip'>您确定要删除吗？</p><p class='ggy-delete-btn'> <span class='ggy-confirm-btn'>确定</span><span class='ggy-cancel-btn'>取消</span></p></div>");

            $deleteIcon.appendTo($imageSection);

            // 点击显示删除确认弹框
            $imageSection.find(".ggy-delete-icon").on('click', function(event) {
                event.stopPropagation();
                $modalSection.html($deleteBox);
                $modalSection.show();
            });

            // 确认删除
            $deleteBox.find(".ggy-confirm-btn").on('click', function(event) {
                event.stopPropagation();
                $modalSection.hide();
                $imageSection.remove();
                $deleteBox.remove();
            });

            // 取消删除
            $deleteBox.find(".ggy-cancel-btn").on('click', function(event) {
                event.stopPropagation();
                $modalSection.hide();
                return false;
            });
        },

        createZoomNode: function($imageSection) {
            var $this = $(this.element),
                $imageShow    = $imageSection.find(".ggy-image-show"),
                $modalSection = $this.find(".ggy-modal-section"),
                $zoomIcon = $("<i class='ggy-zoom-icon'></i>"),
                $zoomBox  = $("<div class='ggy-modal-box ggy-zoom-box'><img src=''/></div>");

            $zoomBox.find('img').attr('src', $imageShow.attr('src'));
            $zoomIcon.appendTo($imageSection);

            // 点击显示弹出框
            $imageSection.find(".ggy-zoom-icon").on('click', function(event) {
                event.stopPropagation();
                $modalSection.html($zoomBox);
                $modalSection.show();
            });

        },

        /**
         * 上传文件
         * @param $file
         */
        ajaxUpload: function($file) {
            var $self = this,
                $this = $(this.element),
                $fileInput = $self.settings.fileInput,
                $ajaxData  = $self.settings.ajaxData,
                $ajaxUrl   = $self.settings.ajaxUrl,
                $allowZoom = $self.settings.allowZoom,
                $success   = $self.settings.success,
                $appendMethod = $self.settings.appendMethod;

            switch ($appendMethod) {
                case "before":
                    var $imageSection = $this.find('.ggy-image-section:first');
                    var $imageShow    = $this.find('.ggy-image-show:first');
                    break;
                case "after":
                    var $imageSection = $this.find('.ggy-image-section:last');
                    var $imageShow    = $this.find('.ggy-image-show:last');
                    break;
            }

            var $formData = new FormData();

            $formData.append($fileInput, $file);

            if ($ajaxData) {
                for (var $key in $ajaxData) {
                    $formData.append($key, $ajaxData[$key]);
                }
            }

            $.ajax({
                url: $ajaxUrl,
                type: 'post',
                async: false,
                data: $formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                mimeType: "multipart/form-data",
                success: function($json) {
                    if ($json.code != 200) {
                        $self.complete = false;
                        $self.callError($json.code, $json.msg);
                        $imageSection.remove();
                        return false;
                    }
                    $self.complete = true;
                    $imageShow.removeClass("shade").attr('src', $json.src);
                    $imageSection.find('input[type=hidden]').val($json.src);
                    if ($allowZoom === true) {
                        $self.createZoomNode($imageSection);
                    }
                    $success($json);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    $self.complete = false;
                    if (jqXHR.status !== 200) {
                        $self.callError(jqXHR.status, 'AjaxUrl Service Error:' + jqXHR.statusText);
                    }
                    $imageSection.remove();
                }
            });
        },

        /**
         * 是否允许上传文件
         * @param $file
         * @returns {boolean}
         */
        isAllowFile: function($file) {
            var $allowType = this.settings.allowType,
                $fileExt   = this.getFileExt($file);
            if ($.inArray($fileExt, $allowType) != -1) {
                return true;
            }
            return false;
        },

        /**
         * 获取文件扩展名
         * @param $file
         * @returns {string}
         */
        getFileExt: function($file) {
            var $fileName = $file.name,
                $index    = $fileName.lastIndexOf('.');
            if ($index < 1) {
                return '';
            }
            return $fileName.substr($index + 1).toLowerCase();
        },

        /**
         * 获取文件大小
         * @param $file
         * @returns {number}
         */
        getFileSize: function($file) {
            return ($file.size) / (1024 * 1024);
        },

        /**
         * 重置上传域
         */
        resetFile: function() {
            $(this.element).find("input[type=file]").val(null);
        },

        /**
         * 调用error函数
         * @param $code
         * @param $msg
         */
        callError: function($code, $msg) {
            var $self  = this,
                $error = $self.settings.error;

            $self.code = $code;
            $self.msg  = $msg;
            $error($self);
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);