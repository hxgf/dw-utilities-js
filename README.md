# DW Utilities (JS)

### A collection of utility functions to facilitate an efficient workflow with the [Darkwave](https://github.com/hxgf/darkwave) web application toolkit.



# Installation
These functions are included with Darkwave, but they can be installed and used as standalone functions in any project.


```
https://cdn.jsdelivr.net/npm/dw-utilities@0.6/dist/dw.min.js
```



# Usage
## dw.api_request()
// fixit list all the functions (note which are internal) and describe what they do and provide example of how to use
```js
    dw.api_request({
      url: '/auth/forgot/process',
      data: {
        email: document.querySelector('[name="email"]').value,
        website: document.querySelector('[name="website"]').value,
      },
      callback: function (r) {
        document.body.classList.remove('working');
        if (r.success) {
          document.querySelector('.card-body').innerHTML = `
            <h2 class="h2 text-center mb-3">Check your email</h2>
            <div class="mb-2 text-center">We just sent you a link to reset your password.</div>
          `;
        } else {
          if (r.error) {
            dw.display_error(r.error.type, r.error.message);
          }
        }
      }
    });
```
