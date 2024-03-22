# DW Utilities (JS)

### A collection of utility functions to facilitate an efficient workflow with the [Darkwave](https://github.com/jyoungblood/darkwave) web application toolkit.



# Installation
These functions are included with Darkwave, but they can be installed and used as standalone functions in any project.


```
<script src="https://cdn.jsdelivr.net/npm/dw-utilities@0.7.2/dist/dw.min.js"></script>
```



# Available Methods

## dw.api_request(cfg)
Makes an XHR request and handles the result with a custom callback. Use the configuration object to define the url, title, and callback.
```js
dw.api_request({
  url: '/auth/login/process',
  data: {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value,
  },
  callback: function (r) {
    document.body.classList.remove('working');
    if (r.success) {
      if (document.querySelector('[name="redirect"]').value){
        window.location.href = document.querySelector('[name="redirect"]').value;
      }else{
        if (window.location.pathname.includes('/login')) {
          window.location.href = '/';
        } else {
          window.location.reload();
        }
      }
    } else {
      document.body.classList.remove('working');
      if (r.error) {
        dw.display_error(r.error.type, r.error.message);
      }
    }
  }
});
```






## dw.serialize(form)
Similar to the [jQuery.serialize()](https://api.jquery.com/serialize/) method, encodes all the names and values (including any radios and checkboxes) from a given form into a query string. Frequently used with `dw.api_request`:
```js
dw.api_request({
  url: '/example/url/endpoint',
  data: {
    form: dw.serialize(document.querySelector('.edit-form'))
  },
  callback: function (r) {
    window.location.href = '/';
  }
});
```






## dw.form_validate(callback)
Checks that all required form fields have values and that no inputs are invalid, halting action and showing errors if applicable. Used by default in in the `dw.edit_form()` `save()` submethod:
```js
dw.form_validate(function () {
  dw.api_request({
    url: cfg.url,
    data: cfg.data,
    callback: callback
  });
});
```






## dw.formbody_encode(data)
Encodes a JSON object as a query string.
```js
dw.formbody_encode({
  id: 6713908723,
  name: 'Brad Jones',
  email: 'bjones333@hotmail.com'
});
```






## dw.cookie_set(name, value, days = 365)
Sets a cookie given a name, value, and optional expiration length (in days, default one year).
```js
dw.cookie_set('flavor', 'oatmeal');
```






## dw.cookie_get(name)
Retrieves a cookie with a given name.
```js
dw.cookie_get('flavor');
```






## dw.cookie_delete(name)
Deletes a cookie with a given name.
```js
dw.cookie_delete('flavor');
```






## dw.cookie_parse(str)
Parses a urlencoded key/val string (the kind that could be saved in a cookie) and returns the data as a JSON object.
```js
dw.cookie_parse('id=6713908723;name=Brad%20Jones;email=bjones333%40hotmail.com');
```






## dw.jwt_parse()
Parses a JSON web token and returns the data as a JSON object.
```js
dw.jwt_parse('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.dyt0CoTl4WoVjAHI9Q_CwSKhl6d_9rhM3NrXuJttkao');
```






## dw.modal(cfg)
Writes the required markup for presenting a [Bootstrap modal](https://getbootstrap.com/docs/5.3/components/modal), accepting various parameters for configuration.
```js
dw.modal({
  title: 'This is a Modal',
  content: `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci animi beatae delectus deleniti dolorem eveniet facere fuga iste nemo nesciunt nihil odio perspiciatis, quia quis reprehenderit sit tempora totam unde.<br /><br />✌️😎`,
  // modal_id: 'custom_modal_id',
  // fade: true,
  // blur: true,
  // centered: true,
  // scrollable: true,
  // hide_x: true,
  // form: true,
  // format: 'small',
  // format: 'large',
  // format: 'full-width',
  // theme: 'success',
  // theme: 'danger',
  // modal_title_extra: 'text-center w-100 py-5 fs-1',
  // modal_body_extra: 'text-center py-5 fs-1',
  // modal_footer_extra: 'text-center py-5 fs-1',
  // modal_header_extra: 'text-center py-5 fs-1',
  // modal_content_extra: 'text-center py-5 fs-1',
  // modal_dialog_extra: 'text-center py-5 fs-1',
  buttons: [
    {
      label: 'Cancel',
      close_modal: true,
      class_extra: 'me-auto',
      callback: function(id){
        dw.modal_destroy(id);
      }
    },
    {
      label: 'Google me',
      color: 'secondary',
      // class_extra: 'me-auto',
      callback: function(id){
        window.open('https://www.google.com/search?q=bladee', '_blank');
      }
    },
    {
      label: 'OK',
      color: 'primary',
      close_modal: true,
      // class_extra: 'w-50 mx-auto',
      callback: function(id){
        alert('called after yes');
        console.log(`modal: id: ${id}`);
      }
    },
  ]
})
```







## dw.modal_destroy(modal_id)
Removes the markup for a given modal.
```js
dw.modal_destroy('custom-modal-id');
```






## dw.validate_input(cfg)
Validates a given input for uniqueness or required value. The `unique` validation parameter defines a call to an API route that can check a given collection and  field. This method is intended to be called on input blur. Here's an example using an Apline.js `x-on:blur` event:
```html
<div class="mb-4 form-group" data-validate="email">
  <label class="form-label">Email</label>
  <input type="email" name="email" x-on:blur="dw.validate_input({
    input: 'email',
    element: $event.target,
    required: true,
    unique: {
      collection: 'users',
      field: 'email',
      error_message: 'This email is already registered',
      exempt_id: '{{locals.user_id}}'
    }
  })" />
  <div class="invalid-feedback"></div>
</div>
```

Additional parameters can be included: `is_email` checks for `x@x.x` format, `error_message` defines a custom error message, `force_focus` will refocus this input on blur, and `regex` defines a custom regex to compare with the field input:
```html
<div class="mb-4 form-group" data-validate="name">
  <label class="form-label">Name</label>
  <input type="text" name="name" x-on:blur="dw.validate_input({
    input: 'name',
    element: $event.target,
    is_email: true,
    error_message: 'Must be an email address',
    force_focus: true,
    regex: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
  })" />
  <div class="invalid-feedback"></div>
</div>
```




## dw.remove_error(data_name)
Removes an error state and message from a specific form field using a `data-validate-X` attribute as a handle.
```js
dw.remove_error('email');
```






## dw.display_error(data_name, error_message)
Sets an error state and message from a specific form field using a `data-validate-X` attribute as a handle.
```js
dw.display_error('email', 'Error: Unregistered email address');
```






## dw.edit_form()
This is used as an [Alpine.js x-data object](https://alpinejs.dev/directives/data) on all "edit" style form fields. It provides submethods for `save()`, `delete_confirm()`, and `delete_execute()`, and is intended for declarative use on HTML elements:
```html
<div x-data="dw.edit_form()">

  <form class="edit-form" action="javascript:void(0);">
    ...
  </form>

  <span data-container="save">
    <button class="btn btn-primary" @click="save({
      'url': '/users/save/',
      'data': {
        '_id': '{{_id}}',
        'form': dw.serialize(document.querySelector('.edit-form'))
      },
      'callback': function(r){
        window.location.href = '/users/';
      }
    })">Save</button>
  </span>

  <span data-container="delete" class="ms-auto">
    <button class="btn btn-outline-danger" @click="delete_confirm({
      'url': '/users/delete/',
      'data': {
        '_id': '{{_id}}',
      },
      'redirect': '/users/',
      'message': 'Are you sure you want to delete this user?'
    })">Delete</button>
  </span>

</div>
```






## dw.upload_initialize(id, cfg = {})
Initializes a Dropzone uploader with a given id and optional configuration parameters.
```js
dw.upload_initialize('avatar',{
  append_form: '#form-id',
  preview_class_extra: '...',
  preview_html: '...',
  dz_options: {
    acceptedFiles: 'image/jpeg,image/png,image/gif',
    maxFilesize: 10,
    url: '/dw/utility/upload-file',
    clickable: `[data-dz-upload="${id}"] .dropzone`,
    previewTemplate: '...'
  },
});
```






## dw.upload_delete(id, cfg = {})
Deletes a given upload with optional configuration parameters.
```js
dw.upload_delete('avatar', {
  append_form: '#form-id',
  confirm: true, 
  reset: true,
  message: 'Replace current avatar?'
});
```
