const btn_apply = document.getElementById('btn_apply');
const newtagForm = document.getElementById('newtagForm');
const tags = document.getElementsByClassName('tagInFilter');
const enchkbox = document.querySelectorAll('.edit_checkbox');
const book_tags_container = document.querySelectorAll('.book_tags_container');
const book_authors_container = document.querySelectorAll('.book_authors_container');
const formSearch = document.getElementById('formSearch')

var presstimer;
for (var i = 0; i < tags.length; i++) {
    tags[i].onmouseup = () => clearTimeout(presstimer);

    tags[i].onmousedown = (e) => {
        presstimer = setTimeout( () => {
            if (confirm(`删除标签${e.target.innerText}`)) {
                fetch(`/tag/${e.target.id.split('_')[1]}/del`, {method:'POST'});
                window.location.reload();
            }
        }, 1000);
    };

    tags[i].onclick = (e) => {
        if (e.target.ariaPressed === 'true') {
            document.getElementById(`${e.target.id}_chkbox`).remove();
        }
        else if (e.target.ariaPressed === 'false' || e.target.ariaPressed === null) {
            formSearch.appendChild(htmlToElement(`
            <input type="checkbox" id="${e.target.id}_chkbox" name="${e.target.id}" style="display:none" checked>
            `));            
        }
    }
}

for (var i = 0; i < enchkbox.length; i++) {
    enchkbox[i].addEventListener('click', (e) => {
        var x = e.currentTarget.parentNode.previousSibling;
        // console.log(e.currentTarget);
        if (x.disabled) {
            x.disabled = false;
            e.currentTarget.innerHTML = '<i class="fas fa-save"></i>';
            e.currentTarget.style.backgroundColor = '#4CAF50';
        }
        else {
            x.disabled = true;
            e.currentTarget.innerHTML = '<i class="fas fa-edit"></i>';
            e.currentTarget.style.backgroundColor = '#007bff';
            var [k, id] = x.id.split('_');
            // console.log(k, id, x.value);
            var data = new FormData();
            data.append(k, x.value);
            fetch(`/api/book/${id}/set`, {
                method: 'POST',
                body: data
            }).then(res => res.json())
            .then(res => {
                if (res.ok) {
                    alert('ok ' + res.msg);
                }
                else {
                    alert('failed ' + res.msg);
                }
            })
        }
    });
}

for (var i = 0; i < book_tags_container.length; i++) {
    var d = book_tags_container[i];
    var bid = d.parentNode.parentNode.id.split('_')[1];
    fetch(`/tag/get/${bid}`, {
        method:'GET'
    }).then (
        res => res.json()
    ).then (
        res => {
            // console.log(res);
            for (let tag of res.tags) {
                // console.log(tag);
                var ele = htmlToElement(`<button class="m-1 booktag btn badge badge-pill badge-primary" type="button" data-toggle="button" id="booktag_${tag.tid}">${tag.name}</button>`);
                ele.onmouseup = () => clearTimeout(presstimer);
                ele.onmousedown = (e) => {
                    presstimer = setTimeout( () => {
                        if (confirm(`删除标签${e.target.innerText}`)) {
                            fetch(`/tag/${tag.tid}/${res.bid}/del`, {method:'POST'})
                            .then( res => res.json())
                            .then(
                                res => {
                                    if (res.ok) {
                                        e.target.remove();
                                    }
                                    else {
                                        alert(res.msg);
                                    }
                                }
                            );
                        }
                    }, 1000);
                };
                document.querySelector(`#bookInfoForm_${res.bid} .book_tags_container`).appendChild(ele);
            }
        }
    )
}

for (var i = 0; i < book_authors_container.length; i++) {
    var d = book_authors_container[i];
    var bid = d.parentNode.parentNode.id.split('_')[1];
    fetch(`/api/author/get/${bid}`, {
        method:'GET'
    }).then (
        res => res.json()
    ).then (
        res => {
            // console.log(res);
            if (!res.ok) return;
            for (let author of res.data) {
                // console.log(tag);
                var ele = htmlToElement(
                    `<span class="badge badge-info mr-1" id="auth_${author.aid}_${bid}">${author.name}</span>`
                );
                ele.onmouseup = () => clearTimeout(presstimer);
                ele.onmousedown = (e) => {
                    presstimer = setTimeout( () => {
                        if (confirm(`删除作者${e.target.innerText}`)) {
                            fetch(`/api/author/del/${author.bid}/${author.aid}/`, {method:'POST'})
                            .then( res => res.json())
                            .then(
                                res => {
                                    if (res.ok) {
                                        e.target.remove();
                                    }
                                    else {
                                        alert(res.msg);
                                    }
                                }
                            );
                        }
                    }, 1000);
                };
                document.querySelector(`#bookInfoForm_${author.bid} .book_authors_container`).appendChild(ele);
            }
        }
    )
}

function add_tag_to_book(ele) {
    if (!confirm(`添加标签: ${ele.innerText}`)) return;
    console.log(ele);
    var tid = ele.id.split('_')[2];
    var bid = ele.id.split('_')[0];
    console.log(bid, tid);
    fetch(`/tag/${tid}/${bid}/new`, {
        method: 'POST',
    }).then(res => res.json())
    .then(
        res => {
            var nele = htmlToElement(`<button class="m-1 booktag btn badge badge-pill badge-primary" type="button" data-toggle="button" id="booktag_${res.tid}">${ele.innerText}</button>`);

            document.querySelector(`#bookInfoForm_${res.bid} .book_tags_container`).appendChild(nele);
        }
    ).catch(err => console.log(err));
}

btn_apply.onclick = function() {
    var tags = document.querySelectorAll('.tag input');
    console.log(tags);
};

newtagForm.addEventListener('submit', (e) => {

    console.log(e);
    var fdata = new FormData(newtagForm);
    fetch('/tag/new', {
        method: 'POST',
        body: fdata,
    }).then(res => res.json()).then(
        res => {
            console.log(res);
            if (res.ok) {
                window.location.reload();
            }
        }
    )
    e.preventDefault();
});


// borrow book btn

const btnBorrow = document.getElementsByClassName('btn-borrow');
const btnDelbook = document.getElementsByClassName('btn-delbook');

for (var i = 0; i < btnDelbook.length; i++) {
    btnDelbook[i].onclick = (e) => {
        var bid = e.target.parentNode.parentNode.parentNode.parentNode.id.split('_')[1];
        if (!confirm(`Delete book ${document.getElementById(`title_${bid}`).value}`)) return;
        fetch(`/api/book/del/${bid}`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(res => {
            if (res.ok) {
                window.location.reload();
            }
            else alert(`Failed err: ${JSON.stringify(res.err)}`);
        })
        .catch(err => console.log(err));
    }
}

for (var i = 0; i < btnBorrow.length; i++) {
    btnBorrow[i].onclick = (e) => {
        var bid = e.target.parentNode.parentNode.parentNode.parentNode.id.split('_')[1];
        if (!confirm(`Borrow book ${document.getElementById(`title_${bid}`).value}`)) return;
        fetch(`/api/borrow/${bid}`, {
            method: 'POST'
        })
        .then( res => res.json())
        .then( res => {
            if (res.ok) {
                alert('Success');
                console.log(res.data);
            }
            else {
                e.target.parentNode.append(htmlToElement(`
                <div class="alert alert-warning alert-dismissible fade show display-block" role="alert">
                    <strong>Failed: </strong> ${res.msg}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                `));
            }
        })
        .catch( err => console.log(err));
    }
}





// borrow list ?

const btnShowBorrow = document.getElementById('btnShowBorrow');
if (btnShowBorrow) {
btnShowBorrow.onclick = (e) => {
    fetch('api/borrow/list', {
        method: 'GET'
    }).then( res => res.json())
    .then( res => {
        if (res.ok) {

            var modalBorrowBody = document.querySelector('#modalBorrow tbody');
            while (modalBorrowBody.firstChild) {
                modalBorrowBody.lastChild.remove();
            }
            for (let x of res.data) {
                modalBorrowBody.appendChild(htmlToElement(`
                <tr>
                    <td>${x.title}</td>
                    <td>${x.stime}</td>
                    <td>${x.ddl}</td>
                    <td><span class="badge badge-info">${x.status}</span></td>
                    <td>
                        ${x.status !== 'returned' ? `<span class="badge badge-primary" style="cursor:pointer;" id="ret_${x.brid}"> Ret </span>` : ''}
                    </td>
                    
                </tr>
                `));
                if (x.status === 'returned') continue;
                document.getElementById(`ret_${x.brid}`).onclick = (e) => {
                    if (!confirm(`Return book : ${x.title} ? `)) {
                        return;
                    }
                    fetch(`/api/return/${x.brid}`, {
                        method:"POST"
                    })
                    .then(res => res.json())
                    .then(res => {
                        if (res.ok) {
                            e.target.parentNode.parentNode.remove();
                        }
                        else {
                            alert(`Failed: ${res.msg}`)
                        }
                    })
                    .catch(err => console.log(err));
                }
            }
        }
        else {
            alert(`res.msg: ${res.msg}\nres.err: \n${JSON.stringify(res.err)}`);
        }
    })
    .catch( err => console.log(err));
}
}

//  pending list

const btnShowPending = document.getElementById('btnShowPending') || {};

btnShowPending.onclick = (e) => {
    fetch('/api/borrow/pending', {
        method: 'GET'
    })
    .then( res => res.json())
    .then( res => {
        if (res.ok) {
            var modalPendingBody = document.querySelector('#modalPending tbody');
            while (modalPendingBody.firstChild) {
                modalPendingBody.lastChild.remove();
            }
            for (let x of res.data) {
                modalPendingBody.appendChild(htmlToElement(`
                <tr>
                    <td>${x.username}</td>
                    <td>${x.title}</td>
                    <td>${x.stime}</td>
                    <td>${x.ddl}</td>
                    <td><span class="badge badge-info">${x.status}</span></td>
                    <td>
                        <span class="badge badge-success" style="cursor:pointer;" id="accept_${x.brid}"> Accept </span>
                        <span class="badge badge-danger" style="cursor:pointer;" id="reject_${x.brid}"> Reject </span>
                    </td>
                    
                </tr>
                `));
                document.getElementById(`accept_${x.brid}`).onclick = (e) => {
                    if (!confirm(`Accept request?`)) {
                        return;
                    }
                    fetch(`/api/borrow/accept/${x.brid}`, {
                        method:"POST"
                    })
                    .then(res => res.json())
                    .then(res => {
                        if (res.ok) {
                            e.target.parentNode.parentNode.remove();
                        }
                        else {
                            alert(`Failed: ${res.msg}`);
                        }
                    })
                    .catch(err => console.log(err));
                }
            }
        }
    })
    .catch( err => console.log(err) );
}


// new book

const formNewBook = document.getElementById('formNewBook') || {};


formNewBook.onsubmit = (e) => {
    e.preventDefault();
    var formdata = new  FormData(formNewBook);
    var authors = [];
    var tags = [];
    for (let x of boxSelectedAuthors.childNodes) {
        authors.push(x.id.split('_')[1]);
    }
    for (let x of document.querySelectorAll('#newBookTags button')) {
        if (x.ariaPressed === 'true') {
            tags.push(x.id.split('_')[2]);
        }
    }

    // console.log(JSON.stringify(authors), JSON.stringify(tags));

    formdata.append('authors', JSON.stringify(authors));
    formdata.append('tags', JSON.stringify(tags));
    
    fetch('/api/book/new', {
        method: 'POST',
        body: formdata
    })
    .then( res => res.json() )
    .then( res => {
        if (res.ok) {
            window.location.reload();
        }
        else {
            let x = document.getElementById('newBookErrMsg');
            for (let e of res.err) {
                x.appendChild(htmlToElement(`
                <div class="alert alert-warning alert-dismissible fade show display-block" role="alert">
                    <strong>Failed: </strong> ${e.msg}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                `));
            }
        }
    })
    .catch( err => console.log(err) );
}

// author

const inputSearchAuthor = document.getElementById('inputSearchAuthor') || {};
const btnAddAuthor = document.getElementById('btnAddAuthor') || {};
const dropdownAuthorHint = document.getElementById('dropdownAuthorHint') || {};
const boxSelectedAuthors = document.getElementById('selectedAuthors') || {};

const inputSearchAuthor_f = document.getElementById('inputSearchAuthor_f') || {};
const btnAddAuthor_f = document.getElementById('btnAddAuthor_f') || {};
const dropdownAuthorHint_f = document.getElementById('dropdownAuthorHint_f') || {};
const boxSelectedAuthors_f = document.getElementById('selectedAuthors_f') || {};

const inputGroupAuthors = document.getElementById('inputGroupAuthors') || {};
document.getElementById('formSearch').onsubmit = (e) => {
    while (inputGroupAuthors.firstChild) {
        inputGroupAuthors.lastChild.remove();
    }
    for (let x of boxSelectedAuthors_f.childNodes) {
        inputGroupAuthors.appendChild(htmlToElement(
            `
            <input type="checkbox" name="${x.id}" checked style="display:none;">
            `
        ));
    }
};

inputSearchAuthor.onfocus = inputSearchAuthor_f.onfocus = (e) => {
    console.log(e.target.parentNode.nextSibling);
    e.target.parentNode.nextSibling.style.display = 'block';
};
inputSearchAuthor.onfocusout = inputSearchAuthor_f.onfocusout = (e) => {
    // console.log(e, dropdownnAuthorHint);
    setTimeout(()=>{
        e.target.parentNode.nextSibling.style.display = 'none';
    }, 200);
};
inputSearchAuthor.oninput = inputSearchAuthor_f.oninput = (e) => {

    let dropdownAuthorHint = e.target.parentNode.nextSibling;
    let inputSearchAuthor = e.target;
    while (dropdownAuthorHint.firstChild) {
        dropdownAuthorHint.lastChild.remove();
    }
    if (e.target.value === "") return;
    
    fetch(`/api/author/search/${e.target.value}`, {
        method: 'GET'
    })
    .then( res => res.json() )
    .then( res => {
        if (res.ok) {
            for (let x of res.data) {
                var ele = htmlToElement(
                    `<div class="dropdown-item" id="auth_${x.aid}_hint">${x.name}</div>`
                );
                ele.onclick = (e) => {
                    inputSearchAuthor.value = e.target.innerText;
                }
                dropdownAuthorHint.appendChild(ele);
            }
        }
    })
    .catch( err => console.log(err) );
};


btnAddAuthor.onclick = btnAddAuthor_f.onclick = (e) => {
    let wtf = e.currentTarget.parentNode.parentNode;
    // console.log(wtf);
    // console.log(wtf.nextSibling);
    let res = e.currentTarget.parentNode.parentNode.nextSibling.childNodes;
    let now = e.currentTarget.parentNode.previousSibling.value;
    
    let boxSelectedAuthors = e.currentTarget.parentNode.parentNode.parentNode.previousSibling;
    for (let x of boxSelectedAuthors.childNodes) {
        if (now === x.firstChild.nodeValue) return;
    }
    for (let x of res) {
        if (x.textContent === now) {
            var ele = htmlToElement(
                `<span class="badge badge-info mr-1" id="auth_${x.id.split('_')[1]}">${now}<span style="cursor:pointer;">×</span></span>`
            );
            ele.firstElementChild.onclick = (e) => {
                e.target.parentNode.remove();
            }
            boxSelectedAuthors.appendChild(ele);
            return;
        }
    }
    if (confirm(`添加新作者: ${now}`)) {
        fetch(`/api/author/new/${now}`, {
            method:'POST'
        })
        .then( res => res.json() )
        .then( res => {
            if (res.ok) {
                // alert('scc add author');
                
                var ele = htmlToElement(
                    `<span class="badge badge-info mr-1" id="auth_${res.data.aid}">${res.data.name}<span style="cursor:pointer;">×</span></span>`
                );
                ele.firstElementChild.onclick = (e) => {
                    e.target.parentNode.remove();
                }
                boxSelectedAuthors.appendChild(
                    ele
                );
            }
            else {
                alert(`Failed ${JSON.stringify(res.err)}`);
            }
        })
        .catch( err => console.log(err) );
    }
};


// users list
const btnShowUsers = document.getElementById('btnShowUsers') || {};

btnShowUsers.onclick = (e) => {
    fetch('/api/user/list', {
        method:'GET'
    })
    .then(res => res.json())
    .then(res => {
        if (res.ok) {
            var usersModalBody = document.querySelector('#modalUsers tbody');
            while (usersModalBody.firstChild) {
                usersModalBody.lastChild.remove();
            }
            for (let x of res.data) {
                usersModalBody.appendChild(htmlToElement(`
                <tr>
                    <td>${x.uid}</td>
                    <td>${x.name}</td>
                    <td>${x.email}</td>
                    <td><span class="badge badge-info" onclick="setUserClass(this)">${x.class}</span></td>                    
                </tr>
                `));
            }
        }
    })
}

function setUserClass(ele) {
    let newClass = prompt(`class in 'admin', 'user'`, 'user');
    if (newClass === null) return;
    fetch(`/api/user/setclass/${ele.parentNode.parentNode.firstElementChild.innerText}/${newClass}`, {
        method:'POST'
    })
    .then(res => res.json())
    .then( res => {
        if (res.ok) {
            ele.innerText = newClass;
        }
        else console.log(JSON.stringify(res.err || res.msg));
    })
    .catch( err => console.log(err));
}

const btnShowUserProfile = document.getElementById('btnShowUserProfile') || {};

btnShowUserProfile.onclick = (e) => {
    fetch('/api/user', {
        method: 'GET'
    })
    .then(res => res.json())
    .then(res => {
        if (res.ok) {
            let userProfileModalBody = document.querySelector('#modalUserProfile table');
            while (userProfileModalBody.firstChild) {
                userProfileModalBody.lastChild.remove();
            }
            userProfileModalBody.appendChild(
                htmlToElement(
                `
                <tbody>
                <tr>
                    <td>用户编号</td>
                    <td>${res.data.uid}</td>
                </tr>
                <tr>
                    <td>用户名</td>
                    <td>${res.data.name}</td>
                </tr>
                <tr>
                    <td>借阅数</td>
                    <td>${res.data.count}</td>
                </tr>
                <tr>
                    <td>邮箱</td>
                    <td>${res.data.email}</td>
                </tr>
                <tr>
                    <td>权限</td>
                    <td><span class="badge badge-info">${res.data.class}</span></td>
                </tr>
                </tbody>
                `
                )
            );
        }
    })
    
}


function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

