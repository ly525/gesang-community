$(function () {
    $('[data-toggle="popover"]').popover()
})

/**
 * 给搜索框的搜索下拉菜单添加点击被选中事件
 */
$(".search-header .dropdown-menu li a").click(function (e) {
    e.preventDefault();
    $("#search-choice-item").text($(this).text());
    $("#index-page-search-form").attr("action", "/search/" + $(this).attr("title"));
});

/**
 *indexConfirmSearchButton
 */

$("#indexConfirmSearchButton").click(function (e) {
    if ($("#indexSearchContent").val().trim().length === 0) {
        alert("搜索内容不能为空");
        return false;
    }
});

/**
 * 初始化Markdown编辑器
 */
if (document.getElementsByTagName("textarea").length > 0) {
    var simplemde = new SimpleMDE({element: $(".simple-markdown-text-area")[0]});
}


/**
 * 使用AJax发起:登录|注册
 */

if (document.getElementById("login-button")) {
    var login_register_result = document.getElementById("login-register-result");
    var login_button          = document.getElementById("login-button");
    login_button.onclick      = function (e) {
        e.preventDefault();
        var login_email                                 = document.getElementById("login-email").value.trim();
        var login_password                              = document.getElementById("login-password").value.trim();
        document.getElementById("login-password").value = "";
        var request                                     = new XMLHttpRequest();
        request.open("POST", '/user/login', true);
        request.setRequestHeader("Content-Type", "application/json")
        request.onload = function () {
            if (request.status === 200) {
                var response = JSON.parse(request.responseText);
                if (response.resultFromServer === "loginSuccess") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML                = "登录成功即将跳转到之前的页面!";
                    if (document.referrer) {
                        window.location.href = document.referrer;
                    } else {
                        window.location.href = "/";
                    }
                    
                    
                } else if (response.resultFromServer === "unactiveEmail") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML                = "您的邮箱未激活,已经给您发送了一封激活邮件,请您前往注册邮箱中查看邮件并激活!";
                    
                } else if (response.resultFromServer === "unregisteredEmail") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML                = "您的邮箱没有注册, 您可以使用该邮箱注册激活之后登录!";
                    
                } else if (response.resultFromServer === "passwordError") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML                = "密码错误!";
                    
                }
                
            }
        };
        request.send(JSON.stringify({
            email   : login_email,
            password: login_password
        }));
        
    };
    
    /**
     * 使用Ajax发起注册请求
     * @type {Element}
     */
    var register_button     = document.getElementById("register-button");
    register_button.onclick = function (e) {
        e.preventDefault();
        var register_nickname        = document.getElementById("register-nickname").value.trim();
        var register_email           = document.getElementById("register-email").value.trim();
        var register_password        = document.getElementById("register-password").value.trim();
        var register_password_repeat = document.getElementById("register-password-repeat").value.trim();
        
        if (register_password !== register_password_repeat) {
            login_register_result.parentNode.style.display = "block";
            login_register_result.innerHTML                = "密码与确认密码不一致";
        }
        
        var request = new XMLHttpRequest();
        request.open("POST", '/user/register', true);
        request.setRequestHeader("Content-Type", "application/json")
        request.onload = function () {
            if (request.status === 200) {
                var response = JSON.parse(request.responseText);
                if (response.resultFromServer === "registerSuccess") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML                = "注册成功, 我们已经向您的邮箱发送了一封注册邮件, 请您前往邮箱查阅邮件, 并激活账户!";
                    
                } else if (response.resultFromServer === "emailAlreadyUsed") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML                = "邮箱已经注册, 请更换邮箱或者直接登录!";
                    
                }
                
            }
        };
        request.send(JSON.stringify({
            nickname: register_nickname,
            email   : register_email,
            password: register_password
        }));
    };
    
}

/**
 * 使用AJax发起:修改昵称｜签名｜邮箱｜密码
 */

if (document.getElementById("buttonUpdateNickNameAndSignature")) {
    var buttonUpdateNickNameAndSignature     = document.getElementById("buttonUpdateNickNameAndSignature");
    buttonUpdateNickNameAndSignature.onclick = function (e) {
        e.preventDefault();
        var newNickname  = document.getElementById("inputNewNickname").value.trim();
        var newSignature = document.getElementById("inputNewSignature").value.trim();
        var nickname     = "<%= user.nickname%>";
        if (newNickname === "<%= user.nickname%>" && newNickname === "<%=user.signature %>") {
            alert("没有做任何修改");
            return;
        }
        var request = new XMLHttpRequest();
        request.open("POST", "/user/updateNickNameAndSignature", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var response = JSON.parse(request.responseText);
                if (response.resultFromServer === "updateNickNameAndSignatureSuccess") {
                    window.location.href = "/user/u/" + "<%= user._id%>";
                } else {
                    document.getElementById("updateNickNameAndSignatureResult").parentNode.style.display = "block";
                    document.getElementById("updateNickNameAndSignatureResult").innerHTML                = "未知异常!";
                    
                }
            }
        };
        request.send(JSON.stringify({
            newNickname : newNickname,
            newSignature: newSignature
        }));
    };
    <!--修改昵称和签名结束-->
    
    
    /**
     * 使用AJax发起:修改邮箱
     */
    
    var buttonModifyEmailAddress     = document.getElementById("buttonModifyEmailAddress");
    buttonModifyEmailAddress.onclick = function (e) {
        e.preventDefault();
        var newEmail = document.getElementById("inputNewEmail").value;
        var request  = new XMLHttpRequest();
        request.open("POST", "/user/updateEmail", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var response = JSON.parse(request.responseText);
                if (response.resultFromServer === "updateEmailSuccess") {
                    document.getElementById("updateEmailResult").parentNode.style.display = "block";
                    document.getElementById("updateEmailResult").innerHTML                = "更新邮箱成功, 我们已经向" + newEmail + "发送了一份验证邮件,请激活!";
                    document.getElementById("inputOldEmail").innerHTML                    = newEmail;
                } else if (response.resultFromServer === "emailAlreadyUsed") {
                    document.getElementById("updateEmailResult").parentNode.style.display = "block";
                    document.getElementById("updateEmailResult").innerHTML                = "邮箱已经被注册,请更换邮箱!";
                    document.getElementById("inputNewEmail").value                        = "";
                } else {
                    document.getElementById("updateEmailResult").parentNode.style.display = "block";
                    document.getElementById("updateEmailResult").innerHTML                = "更新邮箱失败!";
                    document.getElementById("inputOldEmail").innerHTML                    = newEmail;
                }
            }
        };
        request.send(JSON.stringify({
            newEmail: newEmail
        }));
    }
    <!--修改邮箱结束-->
    
    /**
     * 使用AJax发起:修改密码
     */
    
    var buttonModifyPassword     = document.getElementById("buttonModifyPassword");
    buttonModifyPassword.onclick = function (e) {
        e.preventDefault();
        var oldPassword        = document.getElementById("inputOldPassword").value;
        var newPassword        = document.getElementById("inputNewPassword").value;
        var vertifyNewPassword = document.getElementById("inputVertifyNewPassword").value;
        if (oldPassword.length > 0) {
            if (newPassword !== vertifyNewPassword) {
                document.getElementById("updatePasswordResult").parentNode.style.display = "block";
                document.getElementById("updatePasswordResult").innerHTML                = "新密码与确认密码不一致";
            } else {
                var request = new XMLHttpRequest();
                request.open("POST", "/user/updatePassword", true);
                request.setRequestHeader("Content-Type", "application/json");
                request.onreadystatechange = function () {
                    if (request.readyState === 4 && request.status === 200) {
                        var response = JSON.parse(request.responseText);
                        if (response.resultFromServer === "updatePasswordSuccess") {
                            document.getElementById("updatePasswordResult").parentNode.style.display = "block";
                            document.getElementById("updatePasswordResult").innerHTML                = "更新密码成功";
                            oldPassword                                                              = "";
                            newPassword                                                              = "";
                            vertifyNewPassword                                                       = "";
                        } else if (response.resultFromServer === "wrongOldPassword") {
                            document.getElementById("updatePasswordResult").parentNode.style.display = "block";
                            document.getElementById("updatePasswordResult").innerHTML                = "当期密码错误,请重新确认";
                            oldPassword                                                              = "";
                        } else {
                            document.getElementById("updatePasswordResult").parentNode.style.display = "block";
                            document.getElementById("updatePasswordResult").innerHTML                = "未知异常";
                        }
                    }
                }
                request.send(JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }));
            }
        } else {
            document.getElementById("updatePasswordResult").innerHTML = "请输入 当前密码";
            
        }
    }
    <!--修改密码结束-->
}

/**
 * 使用AJax发起: 收藏文章
 */

if (document.getElementById("collect-article-button")) {
    var collect_article_button     = document.getElementById("collect-article-button");
    collect_article_button.onclick = function (e) {
        e.preventDefault();
        var target  = collect_article_button.getAttribute("href");
        var request = new XMLHttpRequest();
        request.open("POST", target, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onload = function () {
            if (request.status === 200) {
                var collect_article_result = JSON.parse(request.responseText);
                if (collect_article_result.resultFromServer === "collectSuccess") {
                    collect_article_button.innerHTML = "已收藏"
                } else {
                    collect_article_button.innerHTML = "收藏文章";
                }
            }
        };
        
        request.send();
    };
}
/**
 * 发送关注某人请求
 * @param {Element} follow_other_button 关注按钮
 */

if (document.getElementById("follow-other-button")) {
    var follow_other_button     = document.getElementById("follow-other-button");
    follow_other_button.onclick = function (e) {
        e.preventDefault();
        
        var target  = follow_other_button.getAttribute("href");
        var request = new XMLHttpRequest();
        request.open("POST", target, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onload = function () {
            if (request.status === 200) {
                var follow_other_result = JSON.parse(request.responseText);
                if (follow_other_result.resultFromServer === "followSuccess") {
                    follow_other_button.innerHTML = "已关注";
                } else {
                    follow_other_button.innerHTML = "关注作者";
                }
            }
        };
        
        request.send();
    };
}

/**
 * Ajax发送点赞文章请求
 * @param {Element} like-article-button 关注按钮
 */

if (document.getElementById("like-article-button")) {
    var like_article_button     = document.getElementById("like-article-button");
    like_article_button.onclick = function (e) {
        e.preventDefault();
        
        var target  = like_article_button.getAttribute("href");
        var request = new XMLHttpRequest();
        alert(target);
        request.open("POST", target, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onload = function () {
            if (request.status === 200) {
                var like_article_result = JSON.parse(request.responseText);
                if (like_article_result.resultFromServer === "likeSuccess") {
                    like_article_button.innerHTML = "已经点赞";
                } else {
                    like_article_button.innerHTML = "点赞文章";
                }
            }
        };
        
        request.send();
    };
}


function postAjaxRequest(data, target, callback) {
    var request = new XMLHttpRequest();
    request.open("POST", target, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = function () {
        console.log(request.status);
        
        if (request.status === 200) {
            callback(JSON.parse(request.responseText));
        }
    };
    request.send(JSON.stringify(data));
}


if (document.getElementById("publishedAnswersArea")) {
    var publishedAnswersArea = document.getElementById("publishedAnswersArea");
    var answers              = publishedAnswersArea.children;
    for (var i = 0; i < answers.length; i++) {
        answers[i].onclick = function (event) {
            var event = event || window.event;
            event.preventDefault();
            var el = event.srcElement;
            console.log(el.className);
            switch (el.className) {
                //点赞
                case 'like':
                    praiseBox();
                    break;
                // 弹出评论框
                case 'glyphicon glyphicon-comment':
                    showCommentBox(nextSiblingElement(el.parentNode.parentNode.nextSibling));
                    break;
                // 隐藏评论框
                case 'btn btn-default btn-sm right-small-button cancel-comment':
                    hiddenCommentBox(el.parentNode);
                    break;
                // 点赞按钮
                case 'glyphicon glyphicon-thumbs-up':
                    praise(el);
                    break;
                case 'btn btn-primary right-small-button create-answer-comment':
                    postAnswerComment(el);
                    break;
            }
        };
    }
}

// 显示评论框

function showCommentBox(commentBox) {
    commentBox.setAttribute("class", "panel-body comment-on");
}

// 隐藏评论框
function hiddenCommentBox(commentBox) {
    commentBox.setAttribute("class", "panel-body comment-off");
}
// 点赞
function praise(el) {
    var praiseElement = el.parentNode.parentNode.getElementsByClassName('like-total')[0];
    var oldTotal      = parseInt(praiseElement.getAttribute("total"));
    var title         = el.getAttribute("title");
    var newTotal;
    if (title === '赞') {
        newTotal = oldTotal + 1;
        console.log("点赞 newTotal" + newTotal)
        praiseElement.innerHTML = (newTotal === 1) ? '我觉得很赞' : '我和' + oldTotal + '个人赞';
        praiseElement.setAttribute("total", newTotal);
        el.style.color = "green";
        el.setAttribute("title", "取消赞");
        
    } else {
        newTotal                = oldTotal - 1;
        praiseElement.innerHTML = (newTotal === 0) ? newTotal + '人赞' : newTotal + '个人觉得很赞';
        praiseElement.setAttribute("total", newTotal);
        el.style.color = "#337ab7";
        el.setAttribute("title", "赞");
        
        
    }
}

/**
 * 获得一个元素的下一个元素节点
 * @param node
 * @returns {*}
 */
function nextSiblingElement(node) {
    if (node.nodeType === 1) {
        return node;
    } else {
        return nextSiblingElement(node.nextSibling);
        
    }
}

/**
 * 使用AJAX 发表答案的评论
 */
function postAnswerComment(el) {
    var textarea = el.parentNode.getElementsByTagName('textarea')[0];
    var content  = textarea.value.trim();
    var data     = {content: content};
    var target   = el.getAttribute("target");
    
    postAjaxRequest(data, target, function (response) {
        if (response.resultFromServer === 'successCreateComment') {

            // 创建评论者昵称和签名
            var ele_strong = document.createElement("strong");
            var ele_a      = document.createElement("a");
            ele_a.setAttribute("href", response.answerComment.author_id);
            console.log("作者"+JSON.stringify(response.answerComment));
            
            var text_node_author_name = document.createTextNode(response.answerComment.author.nickname);
            ele_a.appendChild(text_node_author_name);
            ele_strong.appendChild(ele_a);


            var ele_small                  = document.createElement("small");
            var text_node_author_signature = document.createTextNode("    " + response.answerComment.author.signature);
            ele_small.appendChild(text_node_author_signature);

            // 将昵称和签名进行统计到h6元素内
            var h6_media_heading_nickname = document.createElement('h6');
            h6_media_heading_nickname.setAttribute("class", "media-heading");
            h6_media_heading_nickname.appendChild(ele_strong);
            h6_media_heading_nickname.appendChild(ele_small);


            // 创建评论内容元素
            var p_comment_content = document.createElement('p');
            var comment_content = document.createTextNode(response.answerComment.content);
            p_comment_content.appendChild(comment_content);

            // 创建评论时间元素
            var h6_media_heading_time = document.createElement('h6');
            h6_media_heading_time.setAttribute("class", "media-heading");
            var comment_create_time = document.createTextNode(response.answerComment.create_at_ago());
            h6_media_heading_time.appendChild(comment_create_time);

            // 创建内容主体
            var div_media_body = document.createElement('div');
            div_media_body.setAttribute("class", "media-body");
            div_media_body.appendChild(h6_media_heading_nickname);
            div_media_body.appendChild(p_comment_content);
            div_media_body.appendChild(h6_media_heading_time);


            // 创建评论者头像
            var ele_a_avatar      = document.createElement("a");
            ele_a_avatar.setAttribute("href", "#");

            var ele_img_avatar      = document.createElement("img");
            ele_img_avatar.setAttribute("src", response.answerComment.author.avatarUrl);
            ele_img_avatar.style.width="30px";
            ele_img_avatar.style.height="30px";

            ele_a_avatar.appendChild(ele_img_avatar);

            // 添加头像到左部分
            var div_media_left = document.createElement('div');
            div_media_left.setAttribute("class", "media-left");
            div_media_left.appendChild(ele_a_avatar);

            // 找到tbbody添加新的元素
            var tbody = el.parentNode.getElementsByTagName('tbody')[0];
            var div_media = document.createElement('div');
            div_media.setAttribute("class", "media");
            tbody.appendChild(div_media);
        }
    });
}