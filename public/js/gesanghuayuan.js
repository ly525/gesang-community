


$(function () {
  $('[data-toggle="popover"]').popover()
})

/**
 * 给搜索框的搜索下拉菜单添加点击被选中事件
 */
$(".search-header .dropdown-menu li a").click(function(e){
    alert("***")
    e.preventDefault();
    $("#search-choice-item").text($(this).text());
//        alert($(this).text());
});

/**
 * 初始化Markdown编辑器
 */
if (document.getElementsByTagName("textarea").length>0){
    var simplemde = new SimpleMDE();
    simplemde.value("This text will appear in the editor");
}


/**
 * 使用AJax发起:登录|注册
 */

if(document.getElementById("login-button")){
    var login_register_result       = document.getElementById("login-register-result");
    var login_button                = document.getElementById("login-button");
    login_button.onclick = function(e) {
        e.preventDefault();
        alert("*****");
        var login_email = document.getElementById("login-email").value.trim();
        var login_password = document.getElementById("login-password").value.trim();
        document.getElementById("login-password").value = "";
        var request = new XMLHttpRequest();
        request.open("POST", '/user/login', true);
        request.setRequestHeader("Content-Type", "application/json")
        request.onload = function () {
            if (request.status === 200) {
                var response = JSON.parse(request.responseText);
                if (response.resultFromServer === "loginSuccess") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML = "登录成功即将跳转到之前的页面!";
                    if (document.referrer){
                        window.location.href = document.referrer;
                    }else {
                        window.location.href = "/";
                    }


                } else if (response.resultFromServer === "unactiveEmail") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML = "您的邮箱未激活,已经给您发送了一封激活邮件,请您前往注册邮箱中查看邮件并激活!";

                } else if (response.resultFromServer === "unregisteredEmail") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML = "您的邮箱没有注册, 您可以使用该邮箱注册激活之后登录!";

                }else if (response.resultFromServer === "passwordError") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML = "密码错误!";

                }

            }
        };
        request.send(JSON.stringify({
            email: login_email,
            password: login_password
        }));

    };

    /**
     * 使用Ajax发起注册请求
     * @type {Element}
     */
    var register_button                 = document.getElementById("register-button");
    register_button.onclick = function(e) {
        e.preventDefault();
        var register_nickname           = document.getElementById("register-nickname").value.trim();
        var register_email              = document.getElementById("register-email").value.trim();
        var register_password           = document.getElementById("register-password").value.trim();
        var register_password_repeat    = document.getElementById("register-password-repeat").value.trim();

        if (register_password !== register_password_repeat) {
            login_register_result.parentNode.style.display = "block";
            login_register_result.innerHTML = "密码与确认密码不一致";
        }

        var request = new XMLHttpRequest();
        request.open("POST", '/user/register', true);
        request.setRequestHeader("Content-Type", "application/json")
        request.onload = function () {
            if (request.status === 200) {
                var response = JSON.parse(request.responseText);
                if (response.resultFromServer === "registerSuccess") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML = "注册成功, 我们已经向您的邮箱发送了一封注册邮件, 请您前往邮箱查阅邮件, 并激活账户!";

                } else if (response.resultFromServer === "emailAlreadyUsed") {
                    login_register_result.parentNode.style.display = "block";
                    login_register_result.innerHTML = "邮箱已经注册, 请更换邮箱或者直接登录!";

                }

            }
        };
        request.send(JSON.stringify({
            nickname: register_nickname,
            email: register_email,
            password: register_password
        }));
    };

}

/**
 * 使用AJax发起:修改昵称｜签名｜邮箱｜密码
 */

if(document.getElementById("buttonUpdateNickNameAndSignature")){
    var buttonUpdateNickNameAndSignature = document.getElementById("buttonUpdateNickNameAndSignature");
    buttonUpdateNickNameAndSignature.onclick = function (e) {
        e.preventDefault();
        var newNickname = document.getElementById("inputNewNickname").value.trim();
        var newSignature = document.getElementById("inputNewSignature").value.trim();
        var nickname =  "<%= user.nickname%>";
        if (newNickname === "<%= user.nickname%>" && newNickname === "<%=user.signature %>" ){
            alert("没有做任何修改");
            return;
        }
        var request = new XMLHttpRequest();
        request.open("POST", "/user/updateNickNameAndSignature", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var response = JSON.parse(request.responseText);
                alert(response.resultFromServer);
                if (response.resultFromServer === "updateNickNameAndSignatureSuccess") {
                    window.location.href = "/user/u/"+"<%= user._id%>";
                } else {
                    document.getElementById("updateNickNameAndSignatureResult").parentNode.style.display = "block";
                    document.getElementById("updateNickNameAndSignatureResult").innerHTML = "未知异常!";

                }
            }
        };
        request.send(JSON.stringify({
            newNickname:  newNickname,
            newSignature: newSignature
        }));
        alert("提交");
    };
    <!--修改昵称和签名结束-->


    /**
     * 使用AJax发起:修改邮箱
     */

    var buttonModifyEmailAddress = document.getElementById("buttonModifyEmailAddress");
    buttonModifyEmailAddress.onclick = function (e) {
        e.preventDefault();
        var newEmail = document.getElementById("inputNewEmail").value;
        alert(newEmail);
        var request = new XMLHttpRequest();
        request.open("POST", "/user/updateEmail", true);
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                var response = JSON.parse(request.responseText);
                if (response.resultFromServer === "updateEmailSuccess") {
                    document.getElementById("updateEmailResult").parentNode.style.display = "block";
                    document.getElementById("updateEmailResult").innerHTML = "更新邮箱成功, 我们已经向"+newEmail+"发送了一份验证邮件,请激活!";
                    document.getElementById("inputOldEmail").innerHTML = newEmail;
                } else if (response.resultFromServer === "emailAlreadyUsed" ){
                    document.getElementById("updateEmailResult").parentNode.style.display = "block";
                    document.getElementById("updateEmailResult").innerHTML = "邮箱已经被注册,请更换邮箱!";
                    document.getElementById("inputNewEmail").value = "";
                }else {
                    document.getElementById("updateEmailResult").parentNode.style.display = "block";
                    document.getElementById("updateEmailResult").innerHTML = "更新邮箱失败!";
                    document.getElementById("inputOldEmail").innerHTML = newEmail;
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

    var buttonModifyPassword = document.getElementById("buttonModifyPassword");
    buttonModifyPassword.onclick = function (e) {
        e.preventDefault();
        var oldPassword = document.getElementById("inputOldPassword").value;
        var newPassword = document.getElementById("inputNewPassword").value;
        var vertifyNewPassword = document.getElementById("inputVertifyNewPassword").value;
        if (oldPassword.length > 0) {
            if (newPassword !== vertifyNewPassword) {
                document.getElementById("updatePasswordResult").parentNode.style.display = "block";
                document.getElementById("updatePasswordResult").innerHTML = "新密码与确认密码不一致";
            } else {
                var request = new XMLHttpRequest();
                request.open("POST", "/user/updatePassword", true);
                request.setRequestHeader("Content-Type", "application/json");
                request.onreadystatechange = function () {
                    if (request.readyState === 4 && request.status === 200) {
                        var response = JSON.parse(request.responseText);
                        if (response.resultFromServer === "updatePasswordSuccess") {
                            document.getElementById("updatePasswordResult").parentNode.style.display = "block";
                            document.getElementById("updatePasswordResult").innerHTML = "更新密码成功";
                            oldPassword = "";
                            newPassword = "";
                            vertifyNewPassword ="";
                        } else if (response.resultFromServer === "wrongOldPassword"){
                            document.getElementById("updatePasswordResult").parentNode.style.display = "block";
                            document.getElementById("updatePasswordResult").innerHTML = "当期密码错误,请重新确认";
                            oldPassword = "";
                        } else {
                            document.getElementById("updatePasswordResult").parentNode.style.display = "block";
                            document.getElementById("updatePasswordResult").innerHTML = "未知异常";
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

if(document.getElementById("collect-article-button")){
    var collect_article_button = document.getElementById("collect-article-button");
    collect_article_button.onclick = function (e){
        e.preventDefault();
        var target  =   collect_article_button.getAttribute("href");
        var request =   new XMLHttpRequest();
        request.open("POST", target, true);
        request.setRequestHeader("Content-Type","application/json");
        request.onload = function (){
            if (request.status === 200){
                var collect_article_result = JSON.parse(request.responseText);
                alert(collect_article_result);
                if (collect_article_result.resultFromServer === "collectSuccess"){
                    collect_article_button.innerHTML = "已收藏"
                }else {
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

if(document.getElementById("follow-other-button")){
    var follow_other_button = document.getElementById("follow-other-button");
    follow_other_button.onclick = function (e){
        e.preventDefault();

        var target  =   follow_other_button.getAttribute("href");
        var request =   new XMLHttpRequest();
        request.open("POST", target, true);
        request.setRequestHeader("Content-Type","application/json");
        request.onload = function (){
            if (request.status === 200){
                var follow_other_result = JSON.parse(request.responseText);
                if (follow_other_result.resultFromServer === "followSuccess"){
                    follow_other_button.innerHTML = "已关注";
                }else {
                    follow_other_button.innerHTML = "关注作者";
                }
            }
        };

        request.send();
    };
}