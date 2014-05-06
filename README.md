Thoth
===

---
Polyfills
---

This library includes polyfills for:

- Array manipualtion
	- indexOf (polyfill ECMA 5.1)
	- forEach (polyfill ECMA 5.1)
	- filter (polyfill ECMA 5.1)
	- every (polyfill ECMA 5.1)
	- isArray (polyfill ECMA 5.1)
	- contains (non standard)
	- containsWhere (non standard)
	- remove (non standard)
	- removeAt (non standard)
	- removeWhere (non standard)
- String manipulation
	- trim (polyfill ECMA 5.1)
	- starsWith (polyfill ECMA 6)
	- endsWith (polyfill ECMA 6)
	- format (non standard)

---
Workarounds:
---

In order to provide homogeneos functionality on any "modern" browser (IE8 or newer), the following workarounds are provided:

- DOM manipulation
	- General
		- `thoth.hasAttribute`:

			Returns whatever or not the given element has the given attribute.

		- `thoth.findParent`:

			Returns the parent element of the given element.

		- `thoth.isElement`:

			Return whatever or not the given object is an element.
		- `thoth.measure`:

			Returns the screen dimensions of the given element.

	- Walking elements
		- `thoth.prev`

			Returns the previous element sibling of the given element.

		- `thoth.next`

			Returns the next element sibling of the given element.

	- classes
		- `thoth.addClass`

			Adds the given class to the given element, no duplicates.

		- `thoth.removeClass`

			Removes the given class to the given element.

		- `thoth.hasClass`

			Returns whatever or not the given element has the given class.

	- Form fields
		- `thoth.getValue`

			Returns the value of the given field.

		- `thoth.setValue`

			Sets the value of the given field.
		- `thoth.clearValue`

			Clears the value of the given field (note: not default, but empty value).

		- `thoth.getType`

			Returns the type of the given field. (note: returns artificial types email-one and email-multiple instead of just email).

- Event subscription
	- `thoth.on`

		Subscribes to the given event on the given object, returns a function to unsubscribe.

---
Extras
---

In addition, the following functionality is provided:

- Async execution

	Use the class thoth.Delay to create and control async operations or timers (if repetition is set).

- Async load of script

	Use thoth.include or thoth.include_once to dynamically load scripts.

- Form Validation

	Use thoth.FormValidator to validate forms.

And objects constructors for:

- Dictionary

	Use thoth.Dictionary to create a dictionary.

- Execution dispatcher

	Use thoth.Dispatch to create a context for execution scheduling, or use thoth.Dispatch.global.
	The context allows to set continuations to wait a signal, and to execute those continuations when the signal is given).
