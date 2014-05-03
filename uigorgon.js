/* uigorgon by Alfonso J. Ramos is licensed under a Creative Commons Attribution 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by/4.0/ */

'use strict';

(
	function (uigorgon, window, undefined)
	{
		var months_31 = [1, 3, 5, 7, 8, 10, 12];
		var years_53 = [
			  4,   9,  15,  20,  26,  32,  37,  43,  48,
			 54,  60,  65,  71,  76,  82,  88,  93,  99,
			105, 111, 116, 122, 128, 133, 139, 144, 150,
			156, 161, 167, 172, 178, 184, 189, 195, 201,
			207, 212, 218, 224, 229, 235, 240, 246, 252,
			257, 263, 268, 274, 280, 285, 291, 296, 303,
			308, 314, 320, 325, 331, 336, 342, 348, 353,
			359, 364, 370, 376, 381, 387, 392, 398
		];
		var types_literal = [
			'text',
			'search',
			'email-one',
			'email-multiple',
			'password'
		];
		function findForm(form)
		{
			if (typeof form === 'string')
			{
				return window.document.forms[form];
			}
			else
			{
				if (uigorgon.isElement(form))
				{
					return form;
				}
				else
				{
					return null;
				}
			}
		}
		function processDate(value, type) {
			var parts = null;
			var success = false;
			var years, months, steps;
			switch (type)
			{
				case 'year':
					parts = value.match(/^([0-9]{4})$/);
					if (parts !== null)
					{
						success = window.parseInt(parts[1]) > 0;
						parts = [parts[1]];
					}
					break;
				case 'month':
					parts = value.match(/^([0-9]{4})-(1[12]|0[1-9])$/);
					if (parts !== null)
					{
						success = window.parseInt(parts[1]) > 0;
						parts = [parts[1], parts[2]];
					}
					break;
				case 'day':
				case 'date':
					parts = value.match(/^([0-9]{4})-(1[12]|0[1-9])-([0-9]{2})$/);
					if (parts !== null)
					{
						years = window.parseInt(parts[1]);
						months = window.parseInt(parts[2]);
						steps = window.parseInt(parts[3]);
						if (years > 0 && steps > 0 && steps < 32)
						{
							if (steps <= 28)
							{
								success = true;
							}
							else if (steps === 29)
							{
								if (months === 2)
								{
									success = years % 400 === 0 || (years % 4 === 0 && years % 100 === 0);
								}
								else
								{
									success = true;
								}
							}
							else if (steps === 30)
							{
								success = months !== 2;
							}
							else
							{
								success = months_31.indexOf(months) !== -1;
							}
						}
						parts = [parts[1], parts[2], parts[3]];
					}
					break;
				case 'week':
					parts = value.match(/^([0-9]{4})-W([0-9]{2})$/);
					if (parts !== null)
					{
						years = window.parseInt(parts[1]);
						steps = window.parseInt(parts[2]);
						if (years > 0 && steps > 0 && steps < 54)
						{
							if (steps <= 53)
							{
								return true;
							}
							else
							{
								return years_53.indexOf(years % 400) !== -1;
							}
						}
						parts = [parts[1], parts[2]];
					}
					break;
				case 'datetime':
				case 'datetime-local':
					var regex = '([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}:[0-9]{2}(?::[0-9]{2}(?:\.[0-9]{1,3})?)?)'; 
					if (type === 'datetime')
					{
						regex += 'Z';
					}
					parts = value.match('^' + regex + '$');
					if (parts !== null)
					{
						var date = processDate(parts[1], 'date');
						if (date !== null)
						{
							var time = processDate(parts[2], 'time');
							if (time !== null)
							{
								success = true;
								parts = [date[0], date[1], date[2], time[0], time[1], time[2], time[3]];
							}
						}
					}
					break;
				case 'time':
					parts = value.match(/^([01][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9])(?:\.([0-9]{1,3}))?)?$/);
					if (parts !== null)
					{
						success = true;
						if (typeof parts[3] === 'undefined')
						{
							parts[3] = '00';
						}
						if (typeof parts[4] === 'undefined')
						{
							parts[4] = '000';
						}
						if (parts[4].length === 2)
						{
							parts[4] += '00';
						}
						if (parts[4].length === 1)
						{
							parts[4] += '0';
						}
						parts = [parts[1], parts[2], parts[3], parts[4]];
					}
					break;
				default:
			}
			if (success)
			{
				return parts;
			}
			else
			{
				return null;
			}
		}
		uigorgon.VALIDATION_INVALID_ELEMENT = -1;
		uigorgon.VALIDATION_NOT_VALIDABLE = -2;
		uigorgon.VALIDATION_VALID = 0;
		uigorgon.VALIDATION_TYPE_MISMATCH = 1;
		uigorgon.VALIDATION_PATTERN_MISMATCH = 2;
		uigorgon.VALIDATION_UNDERFLOW = 3;
		uigorgon.VALIDATION_OVERFLOW = 4;
		uigorgon.VALIDATION_MISSING = 5;
		uigorgon.VALIDATION_STEP_MISMATCH = 6;
		uigorgon.VALIDATION_TOO_LONG = 7;
		uigorgon.VALIDATION_CUSTOM_FAILURE = 8;
		function _validateField(field, validator)
		{
			var form = field.form;
			if (uigorgon.isElement(field))
			{
				var result = {};
				if (validator !== null)
				{
					field.validation = field.validation || {};
					field.validation.validator = validator;
					field.validation.revision = validator.getRevision();
					field.validation.result = result;
				}
				var type = uigorgon.getType(field);
				if (type === 'hidden' || type === 'image' || type === 'submit' || type === 'reset' || type === 'button')
				{
					//Not validable
					return result.value = uigorgon.VALIDATION_NOT_VALIDABLE;
				}
				else if (type === 'select-one')
				{
					if (uigorgon.hasAttribute(field, 'required') && field.selectedIndex === -1)
					{
						return result.value = uigorgon.VALIDATION_MISSING;
					}
				}
				else if (type === 'select-multiple')
				{
					//Empty
				}
				else
				{
					var value = uigorgon.getValue(field);
					if ('validation' in field)
					{
						if ('sanitation' in field.validation)
						{
							value = field.validation.sanitation(value);
						}
					}
					var name = field.getAttribute('name');
					if (type === 'radio')
					{
						if (name === null)
						{
							if (uigorgon.hasAttribute(field, 'required') && value !== true)
							{
								return result.value = uigorgon.VALIDATION_MISSING;
							}
						}
						else 
						{
							if (form != null)
							{
								var index = 0;
								//Discover group
								if (validator !== null)
								{
									var required = false;
									var missing = true;
									for (; index < form.elements.length; index++)
									{
										if (form.elements[index].getAttribute('name') === name && uigorgon.getType(form.elements[index]) === type)
										{
											if (uigorgon.getValue(form.elements[index]) === true)
											{
												missing = false;
											}
											if (uigorgon.hasAttribute(form.elements[index], 'required'))
											{
												required = true;
											}
											form.elements[index].validation = form.elements[index].validation || {};
											form.elements[index].validation.validator = validator;
											form.elements[index].validation.revision = validator.getRevision();
											form.elements[index].validation.result = result;
										}
									}
									if (missing && required)
									{
										return result.value = uigorgon.VALIDATION_MISSING;
									}
								}
								else
								{
									for (; index < form.elements.length; index++)
									{
										if (form.elements[index].getAttribute('name') === name && uigorgon.getType(form.elements[index]) === type)
										{
											if (uigorgon.getValue(form.elements[index]) === true)
											{
												break;
											}
											else if (uigorgon.hasAttribute(form.elements[index], 'required'))
											{
												return result.value =uigorgon.VALIDATION_MISSING;
											}
										}
									}
								}
							}
							else
							{
								if (uigorgon.getValue(form.elements[index]) !== true && uigorgon.hasAttribute(field, 'required'))
								{
									return result.value = uigorgon.VALIDATION_MISSING;
								}
							}
						}
					}
					else if (type === 'checkbox')
					{
						if (uigorgon.hasAttribute(field, 'required') && value !== true)
						{
							return result.value = uigorgon.VALIDATION_MISSING;
						}
					}
					else
					{
						/*How to validate MIMETYPE of file?*/
						if (typeof value !== 'string' || value === '')
						{
							if (uigorgon.hasAttribute(field, 'required'))
							{
								return result.value = uigorgon.VALIDATION_MISSING;
							}
						}
						else
						{
							if (type in uigorgon.typeValidations)
							{
								var typevalidation = uigorgon.typeValidations[type];
								if (!typevalidation(value))
								{
									return result.value = result.value = uigorgon.VALIDATION_TYPE_MISMATCH;
								}
							}
							if (types_literal.indexOf(type))
							{
								if (uigorgon.hasAttribute(field, 'pattern'))
								{
									var pattern = field.getAttribute('pattern');
									if (!value.match(pattern))
									{
										return result.value = uigorgon.VALIDATION_PATTERN_MISMATCH;
									}
								}
								if (uigorgon.hasAttribute(field, 'maxlength'))
								{
									var maxlength = parseInt(field.getAttribute('maxlength'));
									if (!window.isNaN(maxlength) && value.length > maxlength)
									{
										return result.value = uigorgon.VALIDATION_TOO_LONG;
									}
								}
							}
							else
							{
								if (type == 'range' || type == 'number')
								{
									if (uigorgon.hasAttribute(field, 'max'))
									{
										var max = parseFloat(field.getAttribute('max'));
										if (!window.isNaN(max) && value > max)
										{
											return result.value = uigorgon.VALIDATION_OVERFLOW;
										}
									}
									if (uigorgon.hasAttribute(field, 'min'))
									{
										var min = parseFloat(field.getAttribute('min'));
										if (!window.isNaN(min) && value < min)
										{
											return result.value = uigorgon.VALIDATION_UNDERFLOW;
										}
										else if (uigorgon.hasAttribute(field, 'step'))
										{
											var step = parseFloat(field.getAttribute('step'));
											if (!window.isNaN(step) && ((value - min) / step) !== parseInt((value - min) / step))
											{
												return result.value = uigorgon.VALIDATION_STEP_MISMATCH;
											}
										}
									}
								}
								else if (type == 'date' || type == 'month' || type == 'week' || type == 'datetime' || type == 'datetime-local' || type == 'time')
								{
									if (uigorgon.hasAttribute(field, 'max'))
									{
										if (!window.isNaN(max) && value > field.getAttribute('max'))
										{
											return result.value = uigorgon.VALIDATION_OVERFLOW;
										}
									}
									if (uigorgon.hasAttribute(field, 'min'))
									{
										if (!window.isNaN(min) && value < field.getAttribute('min'))
										{
											return result.value = uigorgon.VALIDATION_UNDERFLOW;
										}
										/*else if (uigorgon.hasAttribute(field, 'step'))
										{
											//NOT IMPLEMENTED
										}*/
									}
								}
							}
						}
					}
				}
				if (typeof value === 'string' && value !== '')
				{
					if (uigorgon.hasAttribute(field, 'data-validate'))
					{
						var customValidation = field.getAttribute('data-validate');
						var customValidationParameter = field.getAttribute('data-validate-parameter');
						if (customValidation in uigorgon.customValidations)
						{
							if (!uigorgon.customValidations[customValidation](value, customValidationParameter))
							{
								return result.value = uigorgon.VALIDATION_CUSTOM_FAILURE;
							}
						}
					}
				}
				return result.value = uigorgon.VALIDATION_VALID;
			}
			else
			{
				return uigorgon.VALIDATION_INVALID_ELEMENT;
			}
		}
		uigorgon.customValidations = {
			'single-line': function(val) { return val.match(/\r|\n/) === null; },
			'numeric': function(val) { return val.match(/^-?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?$/) !== null; },
			'integer': function(val) { return val.match(/^-?[0-9]+$/) !== null; },
			'decimal': function(val) { return val.match(/^-?[0-9]*\.?[0-9]+$/) !== null; },
			'alpha': function(val) { return val.match(/^[a-zA-Z]+$/) !== null; },
			'alphanumeric': function(val) { return val.match(/^[a-zA-Z0-9]+$/) !== null; },
			'base2': function(val) { return val.match(/^[01]+$/) !== null; },
			'base8': function(val) { return val.match(/^[0-7]+$/) !== null; },
			'base16': function(val) { return val.match(/^[a-fA-F0-9]+$/) !== null; },
			'base64': function(val) { return val.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/) !== null; },
			'base2-encoded': function(val) { return val.match(/^(?:[01]{8})+$/) !== null; },
			'base16-encoded': function(val) { return val.match(/^(?:[a-fA-F0-9]{2})+$/) !== null; },
			'base64-encoded': function(val) { return val.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/) !== null; },
			'domain': function(val) { return val.match(/^(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) !== null; },
			'ipv4': function(val) {return val.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/) !== null; },
			'min-length': function(val, arg) { return val.length >= arg; },
			'max-length': function(val, arg) { return val.length <= arg; },
			'exact-length': function(val, arg) { return val.length === arg; },
			'greater_than': function(val, arg) { return val > arg; },
			'less_than': function(val, arg) { return val < arg; },
			'equals': function(val, arg) { return val === arg; },
			'match': function(val, arg) { return val.match(arg) !== null; },
		};
		uigorgon.typeValidations = {
			'tel': uigorgon.customValidations['single-line'],
			'url': function(val)
						{
							var url_unit = '(?:[a-zA-Z0-9\\$\\(\\)\\*\\+\\-\\.\\?!&\',/:;=@_~]|%[a-fA-F0-9]{2})';
							var url_unit_q = '(?:[a-zA-Z0-9\\$\\(\\)\\*\\+\\-\\.!&\',;=_~]|%[a-fA-F0-9]{2})';
							var url_unit_r = '(?:[a-zA-Z0-9\\$\\(\\)\\*\\+\\-\\.\\?!&\',;=_~]|%[a-fA-F0-9]{2})';
							var url_unit_s = '(?:[a-zA-Z0-9\\$\\(\\)\\*\\+\\-\\.!&\',:;=@_~]|%[a-fA-F0-9]{2})';
							var schema = '(?:[a-zA-Z][a-zA-Z0-9+-.]*)';
							var username = '(?:' + url_unit_q + '*(?:\\:(?:' + url_unit_q + '*))?)';
							var password = '(?:' + url_unit_r + '*(?:\\:(?:' + url_unit_r + '*))?)';
							var userinfo = '(?:' + username + '(?:@' + password + ')?@)?';
							var port = '(?:\\:[0-9]*)?';
							var path = '(?:/' + url_unit_s + '+(?:/' + url_unit_s + '+)*)?'; //not allowing empty path segments
							var query = '(?:\\\?(?:' + url_unit + '*))?';
							var regex = '^' + schema + '\\://' + userinfo + '([^:/]+)' + port + path + query +'$';
							var matches = val.match(regex);
							if (matches === null)
							{
								return false;
							}
							else
							{
								var domain = matches[1];
								return uigorgon.customValidations['domain'](domain);
							}
						},
			'email-one': function(val)
						{
							var matches = val.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([^:/]+)$/);
							if (matches === null)
							{
								return false;
							}
							else
							{
								var domain = matches[1];
								return uigorgon.customValidations['domain'](domain);
							}
						},
			'email-multiple': function(val)
						{
							var emails = val.split(',');
							var email_validation = uigorgon.typeValidations['email-one'];
							for (var index = 0; index < emails.length; index++)
							{
								if (!email_validation(emails[index]))
								{
									return false;
								}
							}
							return true;
						},
			'color' : function(val) { return val.match(/^#[0-9A-Fa-f]{6}$/) !== null; },
			'number': uigorgon.customValidations['numeric'],
			'range': uigorgon.customValidations['numeric'],
			'month': function(val) { return processDate(val, 'month') !== null; },
			'date': function(val) { return processDate(val, 'date') !== null; },
			'week': function(val) { return processDate(val, 'week') !== null; },
			'datetime': function(val) { return processDate(val, 'datetime') !== null; },
			'datetime-local': function(val) { return processDate(val, 'datetime-local') !== null; },
			'time': function(val) { return processDate(val, 'time') !== null; },
		};
		uigorgon.parseDate = function(value, type)
		{
			var data = processDate(value, type);
			var result = new Date(NaN);
			switch (type)
			{
				case 'year':
					result.setFullYear(data[0], 0, 0);
					break;
				case 'month':
					result.setFullYear(window.parseInt(data[0]), window.parseInt(data[1]) - 1, 0);
					break;
				case 'day':
				case 'date':
					result.setFullYear(window.parseInt(data[0]), window.parseInt(data[1]) - 1, window.parseInt(data[2]));
					break;
				case 'week':
					result.setFullYear(window.parseInt(data[0]), 0, 1);
					var day = result.getDay();
					day = (day === 0) ? 7 : day;
					var offset = -day + 1;
					if (offset < -3)
					{
						offset += 7;
					}
					result.setTime(result.getTime() + ((window.parseInt(data[1]) - 1) * 7 + offset) * 24 * 60 * 60 * 1000);
					break;
				case 'datetime':
					result = new Date(Date.UTC(
						window.parseInt(data[0]),		/*year*/
						window.parseInt(data[1]) - 1,	/*month*/
						window.parseInt(data[2]),		/*day*/
						window.parseInt(data[3]),		/*hour*/
						window.parseInt(data[4]),		/*minute*/
						window.parseInt(data[5]),		/*second*/
						window.parseInt(data[6])		/*fraction*/
					));
					break;
				case 'datetime-local':
					result = new Date(
						window.parseInt(data[0]),		/*year*/
						window.parseInt(data[1]) - 1,	/*month*/
						window.parseInt(data[2]),		/*day*/
						window.parseInt(data[3]),		/*hour*/
						window.parseInt(data[4]),		/*minute*/
						window.parseInt(data[5]),		/*second*/
						window.parseInt(data[6])		/*fraction*/
					);
					break;
				case 'time':
					result.setTime(((window.parseInt(data[0]) * 60 +  window.parseInt(data[1])) * 60 + window.parseInt(data[2])) * 1000 + window.parseInt(data[3]));
					break;
				default:
			}
			return result;
		};
		uigorgon.validateField = function(field)
		{
			return _validateField(field, null);
		};
		uigorgon.FormValidator = function (form)
		{
			var revision = 0;
			var _this = this;
			this.callback = function () { };
			this.fields = [];
			this.form = findForm(form);
			this.validClass = '';
			this.invalidClass = '';
			this.getRevision = function ()
			{
				return revision;
			};
			if (this.form === null)
			{
				throw new TypeError();
			}
			this.addSanitation = function(type, sanitation)
			{
				var elements = form.elements;
				for (var index = 0; index < elements.length; index++)
				{
					if (uigorgon.getType(elements[index]) === type)
					{
						elements[index].validation = elements[index].validation | {};
						elements[index].validation.sanitation = sanitation;
					}
				}
			};
			this.apply = function(type, callback)
			{
				var elements = form.elements;
				for (var index = 0; index < elements.length; index++)
				{
					if (uigorgon.getType(elements[index]) === type)
					{
						callback(elements[index]);
					}
				}
			};
			this.validateForm = function()
			{
				var errors = [];
				revision++;
				var elements = form.elements;
				for (var index = 0; index < elements.length; index++)
				{
					if (!('validation' in elements[index]) || elements[index].validation.revision != revision)
					{
						_validateField(elements[index], _this);
					}
					var result = elements[index].validation.result.value;
					if (result > 0)
					{
						uigorgon.addClass(elements[index], this.invalidClass);
						uigorgon.removeClass(elements[index], this.validClass);
						errors.push({element: elements[index], result: result});
					}
					else if (result === 0)
					{
						uigorgon.addClass(elements[index], this.validClass);
						uigorgon.removeClass(elements[index], this.invalidClass);
					}
				}
				return errors;
			};
			var submitHandler = function(event) {
				var errors = _this.validateForm();
				_this.callback.call(_this, errors, event);
				if (errors.length === 0)
				{
					return true;
				}
				else
				{
					if (event && 'preventDefault' in event)
					{
						event.preventDefault();
						return undefined;
					}
					else
					{
						event.returnValue = false;
						return false;
					}
				}
			};
			uigorgon.on(form, 'submit', submitHandler);
		};
		uigorgon.findField = function (form, type)
		{
			var result = [];
			var elements = form.elements;
			for (var index = elements.length; index--;)
			{
				var item = elements[index];
				if (uigorgon.getType(item) === type)
				{
					result.push(item);
				}
			}
			return result;
		};
		uigorgon.getInheritableAttribute = function (element, attribute)
		{
			do
			{
				if (typeof element === 'undefined' || element === null)
				{
					return undefined;
				}
				else if (!uigorgon.isElement(element))
				{
					element = element.parentNode;
				}
				else
				{
					if (uigorgon.hasAttribute(element, attribute))
					{
						return element.getAttribute(attribute);
					}
					else
					{
						element = element.parentNode;
					}
				}
			} while (true);
		};
		uigorgon.hasAttribute = function (element, attribute)
		{
			if ('hasAttribute' in element)
			{
				return element.hasAttribute(attribute);
			}
			else
			{
				return typeof element.getAttribute(attribute) === 'string' && typeof element[attribute] !== 'undefined';
			}
		};
		uigorgon.findParent = function (element, tagName)
		{
			tagName = tagName.toLowerCase();
			do
			{
				if (typeof element === 'undefined' || element === null)
				{
					return null;
				}
				else if (!uigorgon.isElement(element))
				{
					element = element.parentNode;
				}
				else
				{
					if (element.tagName.toLowerCase() === tagName)
					{
						return element;
					}
					else
					{
						element = element.parentNode;
					}
				}
			} while (true);
		};
		uigorgon.isElement = function (node)
		{
			if (typeof window.HTMLElement === 'object')
			{
				return node instanceof window.HTMLElement;
			}
			else
			{
				return typeof node === 'object' && node !== null && node.nodeType === 1;
			}
		};
		uigorgon.isNested = function (element, nest)
		{
			do
			{
				if (!uigorgon.isElement(element))
				{
					return false;
				}
				else if (element === nest)
				{
					return true;
				}
				else
				{
					element = element.parentNode;
				}
			} while (true);
		};
		uigorgon.prev = function (element)
		{
			if ('nextElementSibling' in element)
			{
				return element.previousElementSibling;
			}
			else
			{
				do
				{
					element = element.previousSibling;
				} while (!uigorgon.isElement(element));
				return element;
			}
		};
		uigorgon.next = function (element)
		{
			if ('nextElementSibling' in element)
			{
				return element.nextElementSibling;
			}
			else
			{
				do
				{
					element = element.nextSibling;
				} while (!uigorgon.isElement(element));
				return element;
			}
		};
		uigorgon.addClass = function(element, className)
		{
			if (uigorgon.isElement(element) && typeof className === 'string' && className != '')
			{
				if ('classList' in element)
				{
					element.classList.add(className);
				}
				else
				{
					if (!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)')))
					{
						element.className += ' ' + className;
					}
				}
			}
		};
		uigorgon.removeClass = function(element, className)
		{
			if (uigorgon.isElement(element) && typeof className === 'string' && className != '')
			{
				if ('classList' in element)
				{
					element.classList.remove(className);
				}
				else
				{
					var pattern = new RegExp('(\\s|^)'+className+'(\\s|$)');
					element.className = element.className.replace(pattern, ' ');
				}
			}
		};
		uigorgon.hasClass = function(element, className)
		{
			if (uigorgon.isElement(element) && typeof className === 'string' && className != '')
			{
				if ('classList' in element)
				{
					return element.classList.contains(className);
				}
				else
				{
					return element.className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'));
				}
			}
			else
			{
				return false;
			}
		};
		uigorgon.getValue = function(element)
		{
			var field_type = element.type.toLowerCase();
			switch (field_type)
			{
				case 'radio':
				case 'checkbox':
					return element.checked;
				case 'select-one':
					return element.options[element.selectedIndex];
				case 'select-multiple':
					var result = [];
					for(var index = 0; index < element.options.length; index++)
					{
						var option = element.options[index];
						if (option.selected)
						{
							result.push(option.value);
						}
					}
					return result;
				case 'submit':
				case 'reset':
				case 'button':
				case 'image':
					return undefined;
				default:
					if ('value' in element)
					{
						return element.value;
					}
					else
					{
						return undefined;
					}
			}
		};
		uigorgon.getType = function(element)
		{
			var field_type = element.type.toLowerCase();
			if (field_type === 'text')
			{
				return element.getAttribute('type').toLowerCase();
			}
			else if (field_type === 'email')
			{
				if (uigorgon.hasAttribute(element, 'multiple'))
				{
					return 'email-multiple';
				}
				else
				{
					return 'email-one';
				}
			}
			else
			{
				return field_type;
			}
		};
		uigorgon.setValue = function(element, value)
		{
			var field_type = element.type.toLowerCase();
			switch (field_type)
			{
				case 'radio':
				case 'checkbox':
					element.checked = value;
				case 'select-one':
				case 'select-multiple':
					var index = 0;
					var option;
					if (typeof value === 'string')
					{
						for(; index < element.options.length; index++)
						{
							option = element.options[index];
							if (option.value === value)
							{
								option.selected = true;
								break;
							}
						}
					}
					else
					{
						for(; index < element.options.length; index++)
						{
							option = element.options[index];
							if (value.indexOf(option.value) !==-1)
							{
								option.selected = true;
							}
						}
					}
				case 'submit':
				case 'reset':
				case 'button':
				case 'image':
					break;
				default:
					if ('value' in element)
					{
						element.value = value;
					}
			}
		};
		uigorgon.clearValue = function(element)
		{
			var field_type = element.type.toLowerCase();
			switch (field_type)
			{
				case 'radio':
				case 'checkbox':
					element.checked = false;
				case 'select-one':
				case 'select-multiple':
					element.selectedIndex = -1;
				case 'submit':
				case 'reset':
				case 'button':
				case 'image':
					break;
				default:
					if ('value' in element)
					{
						element.value = "";
					}
			}
		};
		uigorgon.clearForm = function (form)
		{
			var elements = form.elements;
			for (var index = 0; index < elements.length; index++)
			{
				uigorgon.clearValue(elements[index]);
			}
		};
		uigorgon.saveForm = function (form)
		{
			var data = {};
			var elements = form.elements;
			for (var index = 0; index < elements.length; index++)
			{
				var element = elements[index];
				var value = uigorgon.getValue(element);
				if (element.name in data)
				{
					data[element.name].push(value);
				}
				else
				{
					data[element.name] = [value];
				}
			}
			return data;
		};
		uigorgon.loadForm = function (form, data)
		{
			var elements = form.elements;
			var count = {};
			for (var index = 0; index < elements.length; index++)
			{
				var element = elements[index];
				if (element.name in data)
				{
					var subindex = 0;
					if (element.name in count)
					{
						subindex = count[element.name];
					}
					else
					{
						count[element.name] = subindex;
					}
					uigorgon.setValue(element, data[element.name][subindex]);
					count[element.name]++;
				}
			}
		};
		uigorgon.measure = function (element)
		{
			if (uigorgon.isElement(element))
			{
				var result = {};
				result.left = 0;
				result.top = 0;
				result.width = element.offsetWidth;
				result.height = element.offsetHeight;
				do
				{
					result.left += element.offsetLeft;
					result.top += element.offsetTop;
					element = element.offsetParent;
				} while (uigorgon.isElement(element))
				return result;
			}
			else
			{
				return null;
			}
		};
		
		var _events = {};
		
		function _addEventListener(element, eventName, handler)
		{
			if ("addEventListener" in element)
			{
				element.addEventListener(eventName, handler);
				return function(){element.removeEventListener(eventName, handler);};
			}
			else
			{
				eventName = 'on' + eventName;
				var _handler = function(event)
				{
					handler.call(element, event);
				};
				element.attachEvent(eventName, _handler);
				return function() { element.detachEvent('on' + eventName, _handler); };
			}
		}

		uigorgon.addEventListener = function(eventName, handler)
		{
			if (!(eventName in _events))
			{
				_events[eventName] = [];
			}
			_events[eventName].push(handler);
		};
		
		uigorgon.removeEventListener = function(eventName, handler)
		{
			if (eventName in _events)
			{
				_events[eventName].remove(handler);
			}
		};
		
		uigorgon.triggerEvent = function(eventName, event)
		{
			if (eventName in _events)
			{
				for (var index = 0; index < _events[eventName].length; index++)
				{
					var item = _events[eventName][index];
					if ('call' in item)
					{
						item.call(uigorgon, event);
					}
				}
			}
		};
		
		uigorgon.on = function(element, events, handler)
		{
			if (typeof handler === 'function')
			{
				if (typeof events === 'object' && events instanceof Array)
				{
					var result = [];
					var index = 0;
					for (; index < events.length; index++)
					{
						result.push(_addEventListener(element, events[index], handler));
					}
					return result;
				}
				else
				{
					return _addEventListener(element, events, handler);
				}
			}
			else
			{
				return null;
			}
		};
		
		uigorgon.ready = function(callback)
		{
			if (typeof callback === 'function')
			{
				if (window.document.readyState === 'loaded' || window.document.readyState === 'interactive' || window.document.readyState === 'complete')
				{
					callback();
				}
				else
				{
					if ("addEventListener" in window.document)
					{
						window.document.addEventListener('DOMContentLoaded', callback);
					}
					else
					{
						window.document.attachEvent (
							'onreadystatechange',
							function()
							{
								if (window.document.readyState === 'loaded' || window.document.readyState === 'interactive' || window.document.readyState === 'complete')
								{
									if (callback !== null)
									{
										callback();
										callback = null;
									}
								}
							}
						);
					}
				}
			}
		};
	}
)(window.uigorgon = (window.uigorgon || {}), window);