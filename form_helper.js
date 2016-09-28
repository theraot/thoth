(
	function (thoth, window, undefined)
	{
		var sanitations = {
			'upperCase' : function (value){return value.toUpperCase();}
		};
		
		function showEnhancement(target, message, clss, value)
		{
			if (message === '')
			{
				message = '{0}';
			}
			target.setAttribute('class', clss);
			target.innerHTML = String.format(message, '<span>' + value + '</span>')
			target.style.display = '';
		}
		
		function updateCount(event)
		{
			var hasmin = thoth.hasAttribute(this, 'data-minlength');
			var hasmax = thoth.hasAttribute(this, 'data-maxlength');
			var value_length = this.value.length;
			if (hasmin)
			{
				var min_length = parseInt(this.getAttribute('data-minlength'));
				if (value_length < min_length)
				{
					showEnhancement(this.enhanceElement, thoth.getInheritableAttribute(this, 'data-lacking'), thoth.getInheritableAttribute(this, 'data-lacking-class'), min_length - value_length);
					return;
				}
				else if (!hasmax)
				{
					this.enhanceElement.setAttribute('class', '');
					this.enhanceElement.style.display = 'none';
				}
			}
			if (hasmax)
			{
				var max_length = parseInt(this.getAttribute('data-maxlength'));
				if (value_length < max_length)
				{
					showEnhancement(this.enhanceElement, thoth.getInheritableAttribute(this, 'data-remaining'), thoth.getInheritableAttribute(this, 'data-remaining-class'), max_length - value_length);
				}
				else
				{
					showEnhancement(this.enhanceElement, thoth.getInheritableAttribute(this, 'data-excess'), thoth.getInheritableAttribute(this, 'data-excess-class'), value_length - max_length);
				}
			}
			if (event !== undefined && 'preventDefault' in event)
			{
				event.preventDefault();
			}
			return false;
		}
		
		function enhaceLengthCheck(element)
		{
			var hasmin = thoth.hasAttribute(element, 'minlength');
			var hasmax = thoth.hasAttribute(element, 'maxlength');
			if (
				(hasmax || hasmin) &&
				!thoth.hasAttribute(element, 'readonly') &&
				!thoth.hasAttribute(element, 'disabled')
			)
			{
				//---
				var validate = element.getAttribute('data-validate') || '';
				if (hasmax)
				{
					if (validate.length > 0)
					{
						validate += ' ';
					}
					validate += 'max-length($data-maxlength)';
					var max_length = parseInt(element.getAttribute('maxlength'));
					element.setAttribute('data-maxlength', max_length);
					element.removeAttribute('maxlength');
				}
				if (hasmin)
				{
					if (validate.length > 0)
					{
						validate += ' ';
					}
					validate += 'min-length($data-maxlength)';
					var min_length = parseInt(element.getAttribute('minlength'));
					element.setAttribute('data-minlength', min_length);
					element.removeAttribute('minlength');
				}
				element.setAttribute('data-validate', validate);
				element.insertAdjacentHTML('afterend', '<div></div>');
				var target = thoth.next(element);
				element.enhanceElement = target;
				thoth.on(element, ['reset', 'change', 'blur', 'input', 'keyup'], updateCount);
			}
		}
		
		function hideValidation(current)
		{
			if (!thoth.hasClass(current, 'invalid'))
			{
				if (typeof(current.validationElement) !== 'undefined')
				{
					var x = current.validationElement;
					x.style.display = 'none';
				}
			}
		}
		
		thoth.ready(function()
		{
			var validator = thoth.FormValidator;
			thoth.FormValidator = function(form)
			{
				form = thoth.findFormByName(form);
				thoth.apply(form, 'textarea', enhaceLengthCheck);
				thoth.apply(form, 'password', enhaceLengthCheck);
				var result = new validator(form);
				result.addSanitation('text', sanitations[form.getAttribute('sanitize')]);
				result.validClass = 'valid';
				result.invalidClass = 'invalid';
				result.validatingClass = 'validating';
				thoth.on(result, 'clear', function(event)
				{
					thoth.apply(form, null, hideValidation);
				});
				thoth.on(result, 'validated', function(event)
				{
					thoth.apply(form, null, hideValidation);
					if (event.errors.length > 0)
					{
						for (var index = 0; index < event.errors.length; index++)
						{
							var element = event.errors[index].element;
							var name = element.getAttribute('display_name');
							if (typeof(name) === 'undefined' || name === '' || name === null)
							{
								name = element.placeholder;
							}
							if (typeof(name) === 'undefined' || name === '' || name === null)
							{
								name = element.getAttribute('placeholder');
							}
							if (typeof(name) === 'undefined' || name === '' || name === null)
							{
								name = element.name;
							}
							var code = event.errors[index].result;
							var x = null;
							if (typeof(element.validationElement) === 'undefined')
							{
								element.insertAdjacentHTML('afterend', '<div class="invalid"></div>');
								x = thoth.next(element);
								element.validationElement = x;
							}
							else
							{
								x = element.validationElement;
							}
							// ---
							if (code === thoth.VALIDATION_MISSING)
							{
								x.innerHTML = '<span>The field ' + name + ' is required.</span>';
								x.style.display = '';
							}
							else if (code === thoth.VALIDATION_TYPE_MISMATCH)
							{
								x.innerHTML = '<span>The value of the field ' + name + ' is of invalid type.</span>';
								x.style.display = '';
							}
							else if (code === thoth.VALIDATION_PATTERN_MISMATCH)
							{
								x.innerHTML = '<span>The value of the field ' + name + ' doesn\'t have the correct format.</span>';
								x.style.display = '';
							}
							else if (code === thoth.VALIDATION_UNDERFLOW)
							{
								x.innerHTML = '<span>The value of the field ' + name + ' is too small.</span>';
								x.style.display = '';
							}
							else if (code === thoth.VALIDATION_OVERFLOW)
							{
								x.innerHTML = '<span>The value of the field ' + name + ' is too large.</span>';
								x.style.display = '';
							}
							else if (code === thoth.VALIDATION_STEP_MISMATCH)
							{
								x.innerHTML = '<span>The value of the field ' + name + ' is invalid.</span>';
								x.style.display = '';
							}
							else if (code === thoth.VALIDATION_TOO_LONG)
							{
								x.innerHTML = '<span>The value of the field ' + name + ' is too large.</span>';
								x.style.display = '';
							}
							else if (code === thoth.VALIDATION_TOO_SHORT)
							{
								x.innerHTML = '<span>The value of the field ' + name + ' is too small.</span>';
								x.style.display = '';
							}
							else if (code === thoth.VALIDATION_CUSTOM_FAILURE)
							{
								x.innerHTML = '<span>The value of the field ' + name + ' is not valid.</span>';
								x.style.display = '';
							}
							else if (code != 0)
							{
								x.innerHTML = '<span>Verify the value of the field ' + name + '.</span>';
								x.style.display = '';
							}
						}
					}
				});
				return result;
			};
			var noop = function() {};
			var index = window.document.forms.length;
			while(index--)
			{
				var tmp = new thoth.FormValidator(window.document.forms[index]);
				noop(tmp);
			}
		});
	}
)(window.thoth = (window.thoth || {}), window);