/* thoth by Alfonso J. Ramos is licensed under a Creative Commons Attribution 3.0 Unported License. Based on a work at github.com. To view a copy of this license, visit http://creativecommons.org/licenses/by/3.0/ */
(	/* arrays */
	function(thoth, window, undefined)
	{
		thoth.contains = function (array, item)
		{
			var count = array.length;
			var current;
			for (var index = 0; index < count; index++)
			{
				current = array[index];
				if (current === item)
				{
					return true;
				}
			}
			return false;
		};
		
		thoth.containsWhere = function (array, predicate) //Not used
		{
			var count = array.length;
			var current;
			for (var index = 0; index < count; index++)
			{
				current = array[index];
				if (predicate(current))
				{
					return true;
				}
			}
			return false;
		}
		
		if (Array.prototype.every)	//Not used
		{
			thoth.every = function(array, callback)
			{
				return array.every(callback);
			};
		}
		else
		{
			thoth.every = function(array, callback)
			{
				var count = array.length;
				var current;
				for (var index = 0; index < count; index++)
				{
					current = array[index];
					if (!callback(current))
					{
						return false;
					}
				}
				return true;
			};
		}
		
		if (Array.prototype.forEach) //Not used
		{
			thoth.forEach = function(array, callback)
			{
				array.forEach(callback);
			};
		}
		else
		{
			thoth.forEach = function(array, callback)
			{
				var count = array.length;
				var current;
				for (var index = 0; index < count; index++)
				{
					current = array[index];
					callback(current);
				}
			};
		}
		
		if (Array.isArray)
		{
			thoth.isArray = function(array)
			{
				return Array.isArray(array);
			};
		}
		else
		{
			thoth.isArray = function(array)
			{
				return typeof array === 'object' && array instanceof Array;
			};
		}
		
		thoth.pass = function(array_source, array_target)
		{
			return thoth.push(array_target, thoth.pop(array_source));
		};
		
		thoth.pop = function(array)
		{
			var index = array.length - 1;
			var result = array[index];
			array.splice(index, 1);
			return result;
		};
		
		thoth.push = function(array, item)
		{
			return array[array.length] = item;
		};
		
		thoth.put = function(array, item) //Not used
		{
			array.splice(0, 0, item);
		};
		
		thoth.remove = function(array, item)
		{
			var count = array.length;
			var current;
			for (var index = 0; index < count; index++)
			{
				current = array[index];
				if (current === item)
				{
					array.splice(index, 1);
					return true;
				}
			}
			return false;
		};
		
		thoth.removeAt = function(array, key) //Not used
		{
			if (key in array)
			{
				array.splice(key, 1);
				return true;
			}
			else
			{
				return false;
			}
		};
		
		thoth.removeWhere = function(array, predicate) //Not used
		{
			var result = 0;
			var count = array.length;
			var current;
			for (var index = 0; index < count; index++)
			{
				current = array[index];
				if (predicate(current))
				{
					array.splice(index, 1);
					result++;
				}
			}
			return result;
		}
		
		thoth.take = function(array)
		{
			var result = array[0];
			array.splice(0, 1);
			return result;
		};
	}
)(window.thoth = (window.thoth || {}), window);

(	/* delay */
	function(thoth, window, undefined)
	{
		var delayed_operations = [];
		var free_delayed_ids = [0];
		var used_delayed_ids = [];
		
		function _get_delayed_id()
		{
			var id = thoth.pass(free_delayed_ids, used_delayed_ids);
			if (free_delayed_ids.length === 0)
			{
				thoth.push(free_delayed_ids, used_delayed_ids.length);
			}
			return id;
		};
		
		function _free_delayed_id(id)
		{
			if (thoth.remove(used_delayed_ids, id))
			{
				thoth.push(free_delayed_ids, id);
			}
		};
		
		function _run_delayed(id)
		{
			var count = delayed_operations.length;
			var delayed_operation;
			for (var index = 0; index < count; index++)
			{
				delayed_operation = delayed_operations[index];
				if (delayed_operation.id === id)
				{
					clearTimeout(delayed_operation.timeout_id);
					var operation = delayed_operation.operation;
					if (typeof delayed_operation.repeat === 'number')
					{
						delayed_operation.repeat--;
						if (delayed_operation.repeat === 0)
						{
							delayed_operation.repeat = false;
						}
					}
					if (delayed_operation.repeat !== false)
					{
						var timeout_id = setTimeout(function(){_run_delayed(id);}, delayed_operation.delay);
						delayed_operation.timeout_id = timeout_id;
					}
					else
					{
						if (delayed_operation.done !== null)
						{
							delayed_operation.done();
						}
						delayed_operations.splice(index, 1);
						_free_delayed_id(id);
					}
					operation();
					return true;
				}
			}
			return false;
		};
		
		//--------------------------------------------------------------
		
		thoth.delay = function(operation, delay, repeat, done)
		{
			var id = _get_delayed_id();
			var _repeat;
			if (typeof repeat === 'number')
			{
				_repeat = repeat;
			}
			else if (typeof repeat !== 'undefined' && repeat)
			{
				_repeat = true;
			}
			else
			{
				_repeat = false;
			}
			var _done;
			if (typeof done === 'function')
			{
				_done = done;
			}
			else
			{
				_done = null;
			}
			var delayed_operation =
			{
				operation : operation,
				id : id,
				delay : delay,
				done: _done,
				repeat : _repeat
			}
			thoth.push(delayed_operations, delayed_operation);
			var timeout_id = setTimeout(function(){_run_delayed(id);}, delay);
			delayed_operation.timeout_id = timeout_id;
			return id;
		};
		
		thoth.stop = function (id)
		{
			var count = delayed_operations.length;
			var delayed_operation;
			for (var index = 0; index < count; index++)
			{
				delayed_operation = delayed_operations[index];
				if (delayed_operation.id === id)
				{
					var timeout_id = delayed_operation.timeout_id;
					delayed_operations.splice(index, 1);
					_free_delayed_id(id);
					clearTimeout(timeout_id);
					return true;
				}
			}
			return false;
		};
		
		thoth.isRunning = function (id)
		{
			var count = delayed_operations.length;
			var delayed_operation;
			for (var index = 0; index < count; index++)
			{
				delayed_operation = delayed_operations[index];
				if (delayed_operation.id === id)
				{
					return true;
				}
			}
			return false;
		};
	}
)(window.thoth = (window.thoth || {}), window);

(	/* Dictionary */
	function(thoth, window, undefined)
	{
		thoth.Dictionary = function()
		{
			var dic = {};
			var length = 0;
			
			//----------------------------------------------------------
			
			this.contains = function (value) //Not used
			{
				for (var key in dic)
				{
					if (dic[key] === value)
					{
						return true;
					}
				}
				return false;
			}
			
			this.containsKey = function (key)
			{
				if (key in dic)
				{
					return true;
				}
				else
				{
					return false;
				}
			}
			
			this.containsWhere = function (predicate) //Not used
			{
				for (var key in dic)
				{
					if (predicate(dic[key]))
					{
						return true;
					}
				}
				return false;
			}
			
			this.every = function(callback)
			{
				for (var key in dic)
				{
					if (!callback(dic[key]))
					{
						return false;
					}
				}
				return true;
			}
			
			this.forEach = function(callback)
			{
				for (var key in dic)
				{
					callback(dic[key]);
				}
			}
			
			this.get = function (key)
			{
				if (key in dic)
				{
					return dic[key];
				}
				else
				{
					return undefined;
				}
			}
			
			this.length = function()
			{
				return length;
			}
			
			this.remove = function (key)
			{
				if (key in dic)
				{
					var result = dic[key];
					delete dic[key];
					length--;
					return result;
				}
				else
				{
					return undefined;
				}
			}
			
			this.removeWhere = function (predicate) //Not Used
			{
				var result = 0;
				for (var key in dic)
				{
					if (predicate(dic[key]))
					{
						delete dic[key];
						result++;
						length--;
					}
				}
				return result;
			}
			
			this.set = function(key, item)
			{
				if (!(key in dic))
				{
					length++;
				}
				dic[key] = item;
			}
			
			this.take = function()
			{
				var result;
				for (var key in dic)
				{
					result = dic[key];
					delete dic[key];
					length--;
				}
				return result;
			}
			
			this.toString = function()
			{
				var result = '';
				var first = true;
				for (var key in dic)
				{
					if (first)
					{
						first = false;
					}
					else
					{
						result += ',';
					}
					result += key;
				}
				return result;
			}
		}
	}
)(window.thoth = (window.thoth || {}), window);

(	/* Event */
	function(thoth, window, undefined)
	{
		thoth.Event = function()
		{
			var events = new thoth.Dictionary();
			
			function _execute_event(event)
			{
				event.executing = true;
				_execute_event_continue(event);
			}
			
			function _execute_event_continue(event)
			{
				if (event.executing)
				{
					var callin = function()
					{
						step(event);
					};
					var step = function(event)
					{
						var continuations = event.continuations;
						if (continuations.length > 0)
						{
							var continuation = thoth.take(event.continuations);
							continuation();
							thoth.delay(callin, 0, false);
						}
						else
						{
							event.executing = false;
							events.remove(event.id);
						}
					};
					thoth.delay(callin, 0, false);
				}
			}
			
			function _append_event(id, continuation)
			{
				var event = events.get(id);
				if (typeof event === 'undefined')
				{
					return false;
				}
				else
				{
					thoth.push(event.continuations, continuation);
					return true;
				}
			};
			
			//----------------------------------------------------------
			
			this.add = function(id, continuation)
			{
				if (!_append_event(id, continuation))
				{
					events.set (
						id,
						{
							id : id,
							continuations : [continuation],
							executing : false
						}
					);
				}
				return true;
			};
			
			this.go = function (id)
			{
				var event = events.get(id);
				if (typeof event === 'undefined')
				{
					return false;
				}
				else
				{
					_execute_event(event);
					return true;
				}
			};
			
			this.remove = function (id)
			{
				return events.remove(id);
			};
			
			this.stop = function (id)
			{
				var event = events.get(id);
				if (typeof event === 'undefined')
				{
					return false;
				}
				else
				{
					event.executing = false;
					events.remove(event.id);
					return true;
				}
			};
		};
		
		thoth.Event.global = new thoth.Event();
	}
)(window.thoth = (window.thoth || {}), window);

(	/* include */
	function(thoth, window, undefined)
	{
		var loaded_urls = [];
		
		//--------------------------------------------------------------
		
		function _include(url, callback)
		{
			var document = window.document;
			var head = document.getElementsByTagName("head")[0] || document.documentElement;
			var script = document.createElement('script');
			var done = false;
			if (typeof callback === 'function')
			{
				script.onload = script.onreadystatechange = function()
				{
					if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete"))
					{
						done = true;
						if (!thoth.contains(loaded_urls, url))
						{
							thoth.push(loaded_urls, url);
						}
						script.onload = script.onreadystatechange = null;
						if (head && script.parentNode)
						{
							head.removeChild(script);
						}
						callback();
					}
				};
			}
			script.type = 'text/javascript';
			script.async = true;
			script.src = url;
			head.insertBefore(script, head.firstChild);
		};
		
		//--------------------------------------------------------------
		
		thoth.include = function(url, callback)
		{
			if (typeof url === 'string')
			{
				_include(url, callback);
			}
			else if (thoth.isArray(url))
			{
				var go = function()
				{
					if (url.length > 0)
					{
						var _url = thoth.take(url);
						_include(_url, function(){thoth.delay(go, 0, false);});
					}
					else
					{
						callback();
					}
				}
				thoth.delay(go, 0, false);
			}
		};
		
		thoth.include_once = function(url, callback)
		{
			if (typeof url === 'string')
			{
				if (!thoth.contains(loaded_urls, url))
				{
					_include(url, callback);
				}
			}
			else if (thoth.isArray(url))
			{
				var go = function()
				{
					if (url.length > 0)
					{
						var _url = thoth.take(url);
						if (!thoth.contains(loaded_urls, _url))
						{
							_include(_url, function(){thoth.delay(go, 0, false);});
						}
						else
						{
							thoth.delay(go, 0, false);
						}
					}
					else
					{
						callback();
					}
				}
				thoth.delay(go, 0, false);
			}
		};
		
		
		//--------------------------------------------------------------
		
		window.include = thoth.include;
		window.include_once = thoth.include_once;
		
		var metaElements = window.document.getElementsByTagName('meta');
		for (var index = 0; index < metaElements.length; index++)
		{
			var meta = metaElements[index];
			if (meta.getAttribute('name') == 'thoth-load-script')
			{
				thoth.include_once(meta.getAttribute('content'));
			}
		}
	}
)(window.thoth = (window.thoth || {}), window);
