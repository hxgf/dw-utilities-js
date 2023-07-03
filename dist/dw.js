/*!
* DW Utilities (JS)
* @version 0.7.0
* @link https://darkwave.ltd
* Copyright 2016-2023 HXGF (Jonathan Youngblood)
* Licensed under MIT (https://github.com/hxgf/dw-utilities-js/blob/master/LICENSE.md)
*/

var dw = {
  api_request: function (cfg) {
    var data = cfg.data ? cfg.data : {};
    var request = new XMLHttpRequest();
    request.open('POST', cfg.url, true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.onload = function () {
      if (this.status <= 399) {
        // Response success
        if (cfg.callback) {
          cfg.callback(JSON.parse(this.response));
        } else {
          if (cfg.debug) {
            console.log(JSON.parse(this.response));
          }
          return this.response;
        }
      } else {
        // Response error
        document.body.classList.remove('working');
        var error_message = 'Server Error';
        try {
          var r = JSON.parse(this.response);
          if (r.error_code) {
            error_message += ` (${r.error_code})`;
          }
          if (r.error_message) {
            error_message += ` - ${r.error_message}`;
          }
          console.log(r);
        } catch (e) {
          error_message += ` (${this.status})`;
          console.log(this.response);
        }
        alert(error_message + "\nSee console for more details.");
      }
    };
    request.onerror = function () {
      // Connection error
    };
    var query = "";
    for (key in data) {
      query += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]) + "&";
    }
    return request.send(query);
  },
  serialize: function (form) {
    // append RTE fields to form before serializing
    document.querySelectorAll('.quill-editor').forEach(function (editor, i) {
      document.querySelector('input[name="' + editor.getAttribute('data-target') + '"]').value = editor.querySelector('.ql-editor').innerHTML;
      // 								.replace(/<\/p><p>/g, '<br>').replace(/(<br>){2,}/g, '</p><p>')
    });
    // normal form serialization
    var serialized = [];
    for (var i = 0; i < form.elements.length; i++) {
      var field = form.elements[i];
      if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;
      if (field.type === 'select-multiple' || field.type === 'select') {
        for (var n = 0; n < field.options.length; n++) {
          if (!field.options[n].selected) continue;
          serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[n].value));
        }
      }
      else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
        serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
      }
    }
    return serialized.join('&');
  },
  form_validate: function (callback) {
    var required_items = document.querySelectorAll('.required input, .required textarea, .required select');
    var valid = true;
    for (var i = 0; i < required_items.length; i++) {
      var input = required_items[i];
      if (!input.value) {
        input.classList.add('is-invalid')
        input.nextElementSibling.innerHTML = 'Required';
        valid = false;
      }
    }
    if (!valid) {
      var error_title = 'Incomplete Data';
      var error_description = 'Please add missing information to<br /> any <span class="text-danger">required</span> fields and try again.';
    }
    if (document.querySelectorAll('.is-invalid').length > 0) {
      valid = false;
      error_title = 'Invalid Data';
      error_description = 'Please correct any<br /> <span class="text-danger">error</span> fields and try again.';
    }
    if (valid) {
      callback();
    } else {
      document.body.classList.remove('working');
      dw.modal({
        title: `<svg xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-danger icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 9v2m0 4v.01"></path><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"></path></svg><br />${error_title}`,
        content: `<span class="text-muted">${error_description}</span>`,
        format: 'small',
        theme: 'danger',
        centered: true,
        modal_title_extra: 'text-center w-100 pt-2 fs-2',
        modal_body_extra: 'text-center',
        modal_footer_extra: 'border-top-0 bg-transparent',
        buttons: [{
          label: 'OK',
          color: 'danger',
          class_extra: 'w-75 mx-auto mb-3',
          close_modal: true,
        }]
      });
    }
  },
  formbody_encode: function (data) {
    return Object.entries(data).map(([k, v]) => { return k + '=' + v }).join('&');
  },
  cookie_set: function (name, value, days = 365) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  },
  cookie_get: function (name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  },
  cookie_delete: function (name) {
    document.cookie = name + '=; Max-Age=0';
  },
  cookie_parse: function (str) {
    return str
      .split(';')
      .map(v => v.split('='))
      .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
      }, {});
  },
  jwt_parse: function (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  },
  modal: function (cfg) {
    var modal_id = cfg.modal_id ? cfg.modal_id : 'modal' + Math.random().toString(36).slice(2, 7);
    var buttons = '';
    if (cfg.buttons) {
      dw.button_callbacks = {};
      for (var i = 0; i < cfg.buttons.length; i++) {
        if (cfg.buttons[i].callback) {
          dw.button_callbacks[i] = cfg.buttons[i].callback;
        }
        buttons += `<button type="button" class="btn ${cfg.buttons[i].color ? `btn-${cfg.buttons[i].color}` : ''} ${cfg.buttons[i].class_extra ? cfg.buttons[i].class_extra : ''}" ${cfg.buttons[i].close_modal ? `data-bs-dismiss="modal"` : ''} ${cfg.buttons[i].callback ? `onclick="dw.button_callbacks[${i}]('${modal_id}')"` : ''}>${cfg.buttons[i].label}</button>`;
      }
    }
    var modal_content = `
    <div class="modal ${cfg.blur ? 'modal-blur' : ''} ${cfg.fade ? 'fade' : ''}" id="${modal_id}" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog ${cfg.format == 'small' ? 'modal-sm' : ''} ${cfg.format == 'large' ? 'modal-lg' : ''} ${cfg.format == 'full-width' ? 'modal-full-width' : ''} ${cfg.centered ? 'modal-dialog-centered' : ''} ${cfg.scrollable ? 'modal-dialog-scrollable' : ''} ${cfg.modal_dialog_extra ? cfg.modal_dialog_extra : ''}" role="document">
        <div class="modal-content ${cfg.modal_content_extra ? cfg.modal_content_extra : ''}">
        ${cfg.theme ? `<div class="modal-status bg-${cfg.theme}"></div>` : ''}
        ${cfg.format == 'small' ? `
          ${cfg.hide_x ? '' : `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`}
        ` : `
          ${cfg.title ? `
            <div class="modal-header ${cfg.modal_header_extra ? cfg.modal_header_extra : ''}">
              <div class="modal-title ${cfg.modal_title_extra ? cfg.modal_title_extra : ''}">${cfg.title}</div>
              ${cfg.hide_x ? '' : `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`}
            </div>`
        : `
              ${cfg.hide_x ? '' : `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`}
          `}`
      }
          <div class="modal-body ${cfg.modal_body_extra ? cfg.modal_body_extra : ''}">
          ${cfg.form ? '<form action="javascript:void(0);">' : ''}
            ${cfg.format == 'small' ? `
              ${cfg.title ? `<div class="modal-title ${cfg.modal_title_extra ? cfg.modal_title_extra : ''}">${cfg.title}</div>` : ``}            
              ${cfg.content ? `
                <div>${cfg.content}</div>
                `
          : ''}
            `
        : cfg.content}
          ${cfg.form ? '</form>' : ''}
          </div>
          <div class="modal-footer ${cfg.modal_footer_extra ? cfg.modal_footer_extra : ''}">
            ${buttons}
          </div>
        </div>
      </div>
    </div>
    <a href="#" class="d-none" data-bs-toggle="modal" data-bs-target="#${modal_id}"></a>
    `;
    if (document.getElementById(modal_id + "-group")) {
      document.getElementById(modal_id + "-group").remove();
    }
    var g = document.createElement('div');
    g.setAttribute("id", modal_id + "-group");
    document.body.appendChild(g);
    document.getElementById(modal_id + "-group").innerHTML = modal_content;
    document.querySelector('[data-bs-target="#' + modal_id + '"]').click();
  },
  modal_destroy: function (modal_id) {
    if (document.getElementById(modal_id + "-group")) {
      document.getElementById(modal_id + "-group").remove();
    }
  },
  validate_input: function (cfg) {
    dw.prevent_submit = true;
    if (cfg.unique) {
      var request_data = {
        collection: cfg.unique.collection,
        field: cfg.unique.field,
        value: cfg.element.value,
      };
      if (cfg.unique.exempt_id) {
        request_data.exempt_id = cfg.unique.exempt_id;
      }
      dw.api_request({
        url: '/dw/utility/validate-unique/',
        data: request_data,
        callback: function (r) {
          if (r.error) {
            dw.display_error(cfg.input, cfg.unique.error_message ? cfg.unique.error_message : 'Value must be unique');
            dw.prevent_submit = false;
          } else {
            dw.remove_error(cfg.input);
            dw.prevent_submit = false;
          }
        }
      });
    } else {
      if (cfg.required) {
        if (!cfg.element.value) {
          dw.display_error(cfg.input, 'Required');
          // cfg.element.focus();
          dw.prevent_submit = false;
        } else {
          dw.remove_error(cfg.input);
          dw.prevent_submit = false;
        }
      }
    }
  },
  remove_error: function (data_name) {
    document.querySelector('[data-validate="' + data_name + '"] .form-control').classList.remove('is-invalid');
    document.querySelector('[data-validate="' + data_name + '"] .invalid-feedback').innerHTML = '';
  },
  display_error: function (data_name, error_message) {
    document.querySelector('[data-validate="' + data_name + '"] .form-control').classList.add('is-invalid');
    document.querySelector('[data-validate="' + data_name + '"] .invalid-feedback').innerHTML = error_message;
  },
  edit_form: function () {
    return {
      save: function (cfg) {
        if (!dw.prevent_submit) {
          document.body.classList.add('working');
          var callback = cfg.callback ? cfg.callback : false;
          if (cfg.redirect) {
            callback = function (r) {
              window.location.href = cfg.redirect;
            }
          }
          if (cfg.debug) {
            callback = function (r) {
              document.body.classList.remove('working');
              console.log(r);
            }
          }
          dw.form_validate(function () {
            dw.api_request({
              url: cfg.url,
              data: cfg.data,
              callback: callback
            });
          });
        }
      },
      delete_confirm: function (cfg) {
        document.querySelector('[data-container="delete"]').innerHTML = `
        <div class='mb-2 fw-medium'>${cfg.message ? cfg.message : 'Are you sure?'}</div>
        <button class='btn btn-danger' @click='delete_execute(${JSON.stringify(cfg)})'>Yes</button>
        &nbsp; 
        <button class='btn' @click='delete_cancel(${JSON.stringify(cfg)})'>Cancel</button>`;
      },
      delete_execute: function (cfg) {
        document.body.classList.add('working');
        var callback = cfg.callback ? cfg.callback : false;
        if (cfg.redirect) {
          callback = function (r) {
            window.location.href = cfg.redirect;
          }
        }
        if (cfg.debug) {
          callback = function (r) {
            document.body.classList.remove('working');
            console.log(r);
          }
        }
        dw.api_request({
          url: cfg.url,
          data: cfg.data,
          callback: callback
        });
      },
      delete_cancel: function (cfg) {
        document.querySelector('[data-container="delete"]').innerHTML = `<button class='btn btn-outline-danger' @click='delete_confirm(${JSON.stringify(cfg)})'>Delete</button>`;
      }
    };
  },
  dz: [],
  upload_initialize: function (id, cfg = {}) {
    cfg.append_form = cfg.append_form ? cfg.append_form : 'form.edit-form';
    if (document.querySelector(`[data-dz-upload="${id}"] .preview-image img`)) {
      cfg.preview_class_extra = document.querySelector(`[data-dz-upload="${id}"] .preview-image img`).classList.value;
    }
    var dz_options = cfg.dz_options ? cfg.dz_options : {};
      dz_options.acceptedFiles = 'acceptedFiles' in dz_options ? dz_options.acceptedFiles : "image/jpeg,image/png,image/gif";
      dz_options.maxFilesize = 'maxFilesize' in dz_options ? dz_options.maxFilesize : 10;
      dz_options.url = 'url' in dz_options ? dz_options.url : "/dw/utility/upload-file",
      dz_options.clickable = 'clickable' in dz_options ? dz_options.clickable : `[data-dz-upload="${id}"] .dropzone`,
      dz_options.previewTemplate = 'previewTemplate' in dz_options ? dz_options.previewTemplate : '<div class="dz-preview dz-file-preview"><img data-dz-thumbnail /><div class="dz-progress-container"><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div></div></div>';
    if (document.querySelector(`[data-dz-upload="${id}"] .dropzone`)) {
      dw.dz[id] = new Dropzone(document.querySelector(`[data-dz-upload="${id}"] .dropzone`), dz_options);
      dw.dz[id].on('error', function (file, errorMessage) {
        document.body.classList.remove('working');
        dw.modal({
          title: `
          <svg xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-danger icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 9v2m0 4v.01"></path><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"></path></svg><br />        
          Upload Error`,
          content: `<span class="text-muted">${errorMessage}</span>`,
          format: 'small',
          theme: 'danger',
          modal_title_extra: 'text-center w-100 pt-2 fs-2',
          modal_body_extra: 'text-center',
          modal_footer_extra: 'border-top-0 bg-transparent',
          buttons: [
            {
              label: 'OK',
              color: 'danger',
              class_extra: 'w-75 mx-auto mb-3',
              close_modal: true,
              callback: function (modal_id) {
                dw.dz[id].removeAllFiles(true);
                document.querySelector(`[data-dz-upload="${id}"] .dz-message`).style.display = '';
              }
            },
          ]
        })
      });
      dw.dz[id].on('thumbnail', function (file, dataUrl) {
        document.querySelector(`[data-dz-upload="${id}"] .dz-message`).style.display = 'none';
      });
      dw.dz[id].on('uploadprogress', function (file, progress) {
        if (progress == 100) {
          document.querySelector(`[data-dz-upload="${id}"] .dropzone`).style.display = 'none';
          document.body.classList.add('working');
        }
      });
      dw.dz[id].on('success', function (file) {
        var r = JSON.parse(file['xhr']['responseText']);
        if (r.error) {
          document.body.classList.remove('working');
          dw.modal({
            title: `
            <svg xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-danger icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 9v2m0 4v.01"></path><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"></path></svg><br />
            ${r.error_title}`,
            content: `<span class="text-muted">${r.error_message}</span>`,
            format: 'small',
            theme: 'danger',
            modal_title_extra: 'text-center w-100 pt-2 fs-2',
            modal_body_extra: 'text-center',
            modal_footer_extra: 'border-top-0 bg-transparent',
            buttons: [
              {
                label: 'OK',
                color: 'danger',
                class_extra: 'w-75 mx-auto mb-3',
                close_modal: true,
                callback: function (modal_id) {
                  dw.dz[id].removeAllFiles(true);
                  document.querySelector(`[data-dz-upload="${id}"] .dz-message`).style.display = '';
                }
              },
            ]
          });
        } else {
          if (cfg.preview_html) {
            document.querySelector(`[data-dz-upload="${id}"] .preview-image`).innerHTML = cfg.preview_html;
            document.querySelector(`[data-dz-upload="${id}"] .dropzone`).style.display = 'none';
            document.body.classList.remove('working');
          } else {
            document.querySelector(`[data-dz-upload="${id}"] .preview-image`).innerHTML = `<img class="new-upload ${cfg.preview_class_extra ? cfg.preview_class_extra : ''}" src="${r.preview_url}" >
              <div class="upload-delete position-absolute top-0 end-0" data-new="true" data-filename="${r.filename}" data-id="${id}">      
                <span onclick="dw.upload_delete('${id}', {'confirm': false, 'reset': true, 'append_form': '${cfg.append_form}'})" class="d-block cursor-pointer p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="text-danger bi bi-x-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                  </svg>
                </span>
              </div>`;
            document.querySelector(`[data-dz-upload="${id}"] .preview-image .new-upload`).addEventListener('load', function () {
              document.querySelector(`[data-dz-upload="${id}"] .dropzone`).style.display = 'none';
              this.style.display = '';
              document.body.classList.remove('working');
              document.querySelector(`[data-dz-upload="${id}"] .new-upload`).style.display = 'flex';
            });
          }
          document.querySelector(`[data-dz-upload="${id}"]`).classList.remove('error');
          if (document.querySelector('input[name="upload_' + id + '"]')) {
            document.querySelector('input[name="upload_' + id + '"]').value = r.filename;
          } else {
            var file_input = document.createElement('input');
            file_input.setAttribute('type', 'hidden');
            file_input.setAttribute('name', 'upload_' + id);
            file_input.setAttribute('value', r.filename);
            document.querySelector(cfg.append_form).appendChild(file_input);
          }
        }
      });
    }
  },
  upload_delete: function (id, cfg = {}) {
    cfg.append_form = cfg.append_form ? cfg.append_form : 'form.edit-form';
    cfg.message = cfg.message ? cfg.message : `Are you sure you want<br /> to remove this photo?`;
    var cb = function () {
      if (cfg.reset) {
        var filename = document.querySelector('[data-new="true"]').getAttribute('data-filename');
        dw.dz[id].removeAllFiles(true);
        document.querySelector(`[data-dz-upload="${id}"] .dz-message`).style.display = '';
        document.querySelector(`[data-dz-upload="${id}"] .dropzone`).style.display = '';
        document.querySelector(`[data-dz-upload="${id}"] .new-upload`).style.display = 'none';
        document.querySelector(`[data-dz-upload="${id}"] .dropzone`).style.display = '';
        document.querySelector(`[data-dz-upload="${id}"] .preview-image`).innerHTML = '';
        document.querySelector("input[name='upload_" + id + "']").remove();
        dw.api_request({
          url: '/dw/utility/delete-upload',
          data: {
            filename: filename
          }
        });
      } else {
        document.querySelector(`[data-dz-upload="${id}"] .preview-image`).innerHTML = '';
        document.querySelector(`[data-dz-upload="${id}"] .dropzone`).style.display = '';
        if (document.querySelector('input[name="upload_' + id + '"]')) {
          document.querySelector('input[name="upload_' + id + '"]').value = 'DELETE';
        } else {
          var file_input = document.createElement('input');
          file_input.setAttribute('type', 'hidden');
          file_input.setAttribute('name', 'upload_' + id);
          file_input.setAttribute('value', 'DELETE');
          document.querySelector(cfg.append_form).appendChild(file_input);
        }
      }
    }
    if (cfg.confirm) {
      dw.modal({
        title: `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-danger icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 9v2m0 4v.01"></path><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"></path></svg><br />        
        ${cfg.message}`,
        format: 'small',
        theme: 'danger',
        modal_title_extra: 'text-center w-100 pt-2 fs-2 mb-0',
        modal_body_extra: 'text-center',
        modal_footer_extra: 'border-top-0 bg-transparent justify-content-center',
        buttons: [
          {
            label: 'Yes',
            color: 'danger',
            class_extra: 'mb-3 px-3',
            close_modal: true,
            callback: function (modal_id) {
              cb();
            }
          },
          {
            label: 'No',
            close_modal: true,
            class_extra: 'mb-3 px-3',
          },
        ]
      });
    } else {
      cb();
    }
  }
};