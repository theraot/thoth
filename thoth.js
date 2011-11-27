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
		
		if (Array.prototype.forEach)
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
		
		thoth.put = function(array, item)
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
		
		thoth.removeAt = function(array, key)
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
		
		thoth.removeWhere = function(array, predicate)
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
		var pending_modules = new thoth.Dictionary();
		var anonymous_modules = [];
		var loaded_modules = new thoth.Dictionary();
		var loaded_urls = [];
		var event_hub = new thoth.Event();
		
		function createInternalRequire(current_module)
		{
			var result = _require;
			
			result.toUrl = function(str)
			{
				var computed_path = computePath(str);
				if ((computed_path[computed_path.length - 1].split('.')).length > 1)
				{
					return computed_path.join('/');
				}
				else
				{
					return computed_path.join('/') + '.js';
				}
			};
			
			return result;
		};
		
		function createInternalExports(current_module)
		{
			return {};
		}
		
		function createInternalModule(current_module)
		{
			return {
				id : current_module.name
			};
		}
		
		loaded_modules.set('require', {devil: createInternalRequire, cache : false});
		loaded_modules.set('exports', {devil: createInternalExports, cache : false});
		loaded_modules.set('module', {devil: createInternalModule, cache : false});
		
		//--------------------------------------------------------------
		
		function processDependencies(current_module, dependencies)
		{
			var pending_dependencies = [];
			var processed_dependencies = [];
			var relative_to = current_module.path;
			thoth.forEach (
				dependencies,
				function(current)
				{
					var processed_id = process_id(current, relative_to)
					var _current = processed_id.fullname;
					if (loaded_modules.containsKey(_current))
					{
						var loaded_module = loaded_modules.get(_current);
						current_module.fillParameter(_current, loaded_module.devil, loaded_module.cache);
					}
					else if (current_module.notify)
					{
						thoth.put (pending_dependencies, _current);
						event_hub.add (
							_current,
							function()
							{
								current_module.load_handler(_current);
							}
						);
					}
					thoth.push (processed_dependencies, _current);
				}
			);
			current_module.pending_dependencies = pending_dependencies;
			current_module.dependencies = processed_dependencies;
		};
		
		function createModule(id, dependencies, factory, referal)
		{
			var current_module = {};
			var parameters = [];
			var parametersCache = [];
			var processed_id = process_id(id, referal === null ? null : referal.path);
			if (loaded_modules.containsKey(processed_id.fullname))
			{
				return loaded_modules.get(processed_id.fullname);
			}
			else
			{
				current_module.path = processed_id.path;
				current_module.name = processed_id.name;
				current_module.fullname = processed_id.fullname;
				current_module.plugins = processed_id.plugins;
				current_module.factory = factory,
				current_module.fillParameter = function(name, value, cache)
				{
					if (cache)
					{
						parametersCache[name] = value;
						if (name in parameters)
						{
							delete parameters[name];
						}
					}
					else
					{
						if (name in parametersCache)
						{
							delete parametersCache[name];
						}
						parameters[name] = value;
					}
				};
				current_module.readParameter = function(name)
				{
					if (name in parametersCache)
					{
						return parametersCache[name];
					}
					else
					{
						var value = parameters[name];
						if (typeof value === 'function')
						{
							var tmp = value(current_module);
							if (typeof tmp !== 'undefined')
							{
								parametersCache[name] = tmp;
							}
							return tmp;
						}
						else
						{
							parametersCache[name] = value;
							return value;
						}
					}
				};
				current_module.hasParameter = function(name)
				{
					return name in parameters;
				};
				current_module.load = function()
				{
					load(current_module);
				};
				current_module.load_handler = function(fullname)
				{
					if (thoth.remove(current_module.pending_dependencies, fullname))
					{
						if (loaded_modules.containsKey(fullname))
						{
							var loaded_module = loaded_modules.get(fullname);
							current_module.fillParameter(fullname, loaded_module.devil, loaded_module.cache);
						}
						else
						{
							current_module.fillParameter(fullname, undefined);
						}
						thoth.delay(current_module.load, 0, false);
					}
				};
				current_module.notify = true;
				processDependencies(current_module, dependencies);
				if (current_module.pending_dependencies.length > 0)
				{
					if (current_module.name === '' )
					{
						thoth.push(anonymous_modules, current_module);
					}
					else
					{
						pending_modules.set(current_module.fullname, current_module);
					}
				}
				return current_module;
			}
		};
		
		//--------------------------------------------------------------
		
		function validateDependencies (dependencies)
		{
			if (thoth.isArray(dependencies))
			{
				return thoth.every(
					dependencies,
					function(current)
					{
						return typeof current === 'string';
					}
				);
			}
			else
			{
				return false;
			}
		};
		
		function computePath(target, relative_to)
		{
			var path;
			if (typeof relative_to === 'string')
			{
				path = relative_to.split('/').concat(target.split('/'));
			}
			else
			{
				path = target.split('/')
			}
			var length = path.length;
			var computed_path = [];
			for (var index = 0; index < length; index ++)
			{
				if (path[index] === '.')
				{
					continue;
				}
				else if (path[index] === '..')
				{
					if (computed_path.length > 0)
					{
						thoth.pop(computed_path);
					}
					else
					{
						thoth.push(computed_path, '..');
					}
				}
				else
				{
					thoth.push(computed_path, path[index]);
				}
			}
			if (computed_path.length === 0)
			{
				computed_path = ['.'];
			}
			return computed_path;
		};
		
		function process_id(id, relative_to)
		{
			var plugins = id.split('!');
			var name = thoth.pop(plugins);
			var path = name === '' ? [] : computePath(name, null);
			if (name !== '')
			{
				name = thoth.pop(path);
			}
			if (name === '.' || name === '..')
			{
				throw 'Invalid id "' + id + '"';
			}
			else
			{
				var _path = path.join('/'); 
				var fullname = _path !== '' ? _path + '/' + name : name;
				return {
					path : _path,
					name : name,
					fullname : fullname,
					plugins : plugins
				};
			}
		};
		
		function doEvil(current_module)
		{
			var devil = undefined;
			if (typeof current_module.factory === 'function')
			{
				var evil = 'current_module.factory(';
				for (var index = 0; index < current_module.dependencies.length; index++)
				{
					var dependency = current_module.dependencies[index];
					if (index != 0)
					{
						evil += ', ';
					}
					evil += 'current_module.readParameter("' + dependency + '")';
				}
				evil += ')';
				devil = eval(evil);
			}
			else
			{
				devil = current_module.factory;
			}
			if (typeof devil === 'undefined' && current_module.hasParameter('exports'))
			{
				devil = current_module.readParameter('exports');
			}
			if (current_module.name === '')
			{
				thoth.remove(anonymous_modules, current_module);
				if (thoth.config.autoGatherModuleNames && !current_module.required && typeof devil !== 'undefined' && typeof devil.name === 'string')
				{
					current_module.name = devil.name;
					current_module.fullname = current_module.path !== '' ? current_module.path + '/' + current_module.name : current_module.name;
					current_module.cache = true;
					current_module.devil = devil;
					loaded_modules.set(current_module.fullname, current_module);
					event_hub.go(current_module.fullname);
				}
			}
			else
			{
				pending_modules.remove(current_module.fullname);
				current_module.cache = true;
				current_module.devil = devil;
				loaded_modules.set(current_module.fullname, current_module);
				event_hub.go(current_module.fullname);
			}
		};
		
		function createLoadState(sync)
		{
			var result = {};
			result.modules_to_load = new thoth.Dictionary(),
			result.delay_module = function (current_module)
			{
				result.modules_to_load.set(current_module.fullname, current_module);
				current_module.delayed = true;
			},
			result.skip_dependency = function (current_module, current_dependency)
			{
				thoth.push(current_module.pending_dependencies, current_dependency);
			}
			result.sync = sync ? true : false;
			return result;
		};
		
		function load(current_module, sync)
		{
			if (typeof current_module !== 'undefined')
			{
				var state = createLoadState(sync);
				
				state.modules_to_load.set(current_module.fullname, current_module);
				
				var callin = function ()
				{
					step(state);
				}
				
				var step = function(state)
				{
					do
					{
						if (state.modules_to_load.length() > 0)
						{
							var current_module = state.modules_to_load.take();
							if (loaded_modules.containsKey(current_module.fullname))
							{
								thoth.delay(callin, 0, false);
								return;
							}
							else
							{
								var _load = true;
								while (current_module.pending_dependencies.length > 0)
								{
									var current_dependency = thoth.pop(current_module.pending_dependencies);
									if (current_module.hasParameter(current_dependency))
									{
										continue;
									}
									else if (loaded_modules.containsKey(current_dependency))
									{
										var loaded_module = loaded_modules.get(current_dependency);
										current_module.fillParameter(current_dependency, loaded_module.devil, loaded_module.cache);
										continue;
									}
									else if (pending_modules.containsKey(current_dependency))
									{
										//We may have a circular reference, we will fill the parameter and continue to load meanwhile
										var module = pending_modules.get(current_dependency);
										current_module.fillParameter
										(
											current_dependency,
											function()
											{
												var fullname = module.fullname;
												load(module, true);
												if (loaded_modules.containsKey(fullname))
												{
													var loaded_module = loaded_modules.get(fullname);
													if (loaded_module.cache)
													{
														return loaded_module.devil;
													}
													else
													{
														return loaded_module.devil();
													}
												}
												else
												{
													return undefined;
												}
											}
										);
										if (!module.delayed && !current_module.delayed)
										{
											state.delay_module(current_module);
											_load = false;
											continue;
										}
									}
									//----
									{
										state.skip_dependency(current_module, current_dependency);
										if (thoth.config.autoIncludeFiles)
										{
											var url = current_dependency + '.js';
											if (!thoth.contains(loaded_urls, url))
											{
												_include(url);
											}
										}
										//
										_load = false;
										break;
									}
								}
								if (_load)
								{
									doEvil(current_module);
									return;
								}
								else if (state.modules_to_load.length() > 0)
								{
									if (!sync)
									{
										thoth.delay(callin, 0, false);
									}
								}
							}
						}
					}while(state.sync && state.modules_to_load.length() > 0);
				}
				if (sync)
				{
					callin();
				}
				else
				{
					thoth.delay(callin, 0, false);
				}
			}
		};
		
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
		
		function _buildModule (id, dependencies, factory)
		{
			//For anonymous functions
			if (typeof id !== 'string')
			{
				factory = dependencies;
				dependencies = id;
				id = '';
			}
			//Dependencies defaults
			if (typeof factory === 'undefined')
			{
				if (typeof dependencies === 'function')
				{
					factory = dependencies;
					dependencies = ["require", "exports", "module"];
				}
				else 
				{
					var result = dependencies;
					factory = function(){return result;}
					dependencies = ["require", "exports", "module"];
				}
			}
			else if (typeof dependencies === 'undefined')
			{
				dependencies = ["require", "exports", "module"];
			}
			if (typeof id !== 'string' || !thoth.isArray(dependencies))
			{
				throw 'Invalid Arguments on function define';
			}
			else
			{
				if (!validateDependencies(dependencies))
				{
					throw 'Invalid Argument dependencies on function define';
				}
				else
				{
					return current_module = createModule(id, dependencies, factory, null);
				}
			}
		}
		
		function _require(dependencies, factory)
		{
			var unique = false;
			if (typeof dependencies === 'string')
			{
				dependencies = [dependencies];
				unique = true;
			}
			if (typeof factory !== 'function')
			{
				factory = function(){};
			}
			var current_module = _buildModule('', dependencies, factory);
			var result = [];
			var fakeModule =
			{
				path : current_module.path,
				notify : false,
				fillParameter : function(name, value, cache)
				{
					if (cache)
					{
						result[name] = value;
					}
				}
			};
			processDependencies(fakeModule, dependencies);
			current_module.required = true;
			current_module.load();
			if (unique)
			{
				return result[dependencies[0]];
			}
			else
			{
				return result;
			}
		}
		
		//--------------------------------------------------------------
		
		thoth.require = function(dependencies, factory)
		{
			return _require(dependencies, factory);
		};
		
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
		
		thoth.define = function(id, dependencies, factory)
		{
			var current_module = _buildModule(id, dependencies, factory);
			if (thoth.config.autoLoadModules)
			{
				current_module.load();
			}
		};
		
		//--------------------------------------------------------------
		
		thoth.config = {};
		thoth.config.autoIncludeFiles = false;
		thoth.config.autoGatherModuleNames = false;
		thoth.config.autoLoadModules = false;
		
		window.require = thoth.require;
		window.include = thoth.include;
		window.include_once = thoth.include_once;
		window.define = thoth.define;
		
		/* partial implementation of https://github.com/amdjs/amdjs-api/wiki */
		thoth.define.amd = {};
		window.define.amd = thoth.define.amd;
		
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

window.thoth.define(
	'thoth',
	function()
	{
		return window.thoth;
	}
);
