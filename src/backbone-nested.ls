# Backbone-Nested 1.1.2 - An extension of Backbone.js that keeps track of nested attributes
#
# http://afeld.github.com/backbone-nested/
#
# Copyright (c) 2011-2012 Aidan Feldman
# MIT Licensed (LICENSE)
#
# LiveScript version by Isak Bakken

_delayedTriggers = []

class Backbone.NestedModel extends Backbone.Model
  ->
    super ...

  @attrPath = makeAttrPath
  @createAttrStr = makeAttrString
  @deepClone = deepClone


  get: (attrStrOrPath) ->
    _ makeAttrPath attrStrOrPath .reduce ((v, k) -> v?[k]), @attributes


  set: (key, value, options) ->
    | _.isArray key  => @_setNested {path: key, value, options}
    | _.isObject key => @_setNested {attrs: key, options: value}
    |_               => @_setNested {path: makeAttrPath(key), value, options}

  _setNested: ({path, attrs, value, options || {}}) ->
    newAttrs = deepClone @attributes
    if attrs
      for own key, val of attrs
        val = null  if options.unset
        @_setAttr newAttrs, makeAttrPath(key), val, options
    else # should be path array
      @_setAttr newAttrs, path, value, options

    unless @_validate newAttrs, options
      # reset changed attributes
      @changed = {}
      return false

    silentOpts = {} <<<< options <<<< {+silent}
    if options.unset and path?.length == 1
      # unsetting top-level attribute
      superclass::set.call this, "#{path[0]}": null, silentOpts
    else
      # normal set(), or an unset of nested attribute
      # make sure Backbone.Model won't unset the top-level attribute
      delete silentOpts.unset  if path and silentOpts.unset
      superclass::set.call this, newAttrs, silentOpts

    @_checkChanges options

    this


  add: (attrStr, value, opts) ->
    current = @get(attrStr)
    throw new Error("current value is not an array")  unless _.isArray(current)
    @set attrStr + "[" + current.length + "]", value, opts


  remove: (attrStr, opts || {}) ->
    attrPath = makeAttrPath(attrStr)
    aryPath = _.initial(attrPath)
    val = @get(aryPath).slice(0)
    i = _.last(attrPath)
    throw new Error("remove! must be called on a nested array")  unless _.isArray(val)
    # remove the element from the array
    val.splice i, 1
    @set aryPath, val, opts
    this


  toJSON: ->
    deepClone @attributes


  # private

  _checkChanges: !(options ? {}) ->
    changes = if options.silent then @_silent else {}

    if checkChanges @_previousAttributes, @attributes, []
      #trigger 'change', this, @attributes, options
      @change options <<<< {changes}  unless options.silent

    ~function checkChanges prev, now, path
      hasChanged = false
      hasRemoved = false
      hasAdded = false
      parentArrayS = makeAttrString path  if _.isArray prev
      for a in _.uniq(_.keys(prev || {}) +++ _.keys(now || {}))
        oldVal = prev?[a] ? null
        newVal = now?[a] ? null

        unless _.isEqual newVal, oldVal
          attrP = path +++ [numericArrayAccessors a]
          attrS = makeAttrString(attrP)
          hasChanged = true
          @changed[attrS] = newVal
          if parentArrayS
            # Events for array elements really make things ugly... I would
            # consider not supporting the remove: and add: events. Also, for
            # simplicity, I would consider to not support the bracket syntax for
            # referencing array elements, i.e. arr[0] would instead be arr.0
            if not newVal? and not hasRemoved
              @trigger "remove:" + parentArrayS, this, null, options
              hasRemoved = true
            else if not oldVal? and not hasAdded
              @trigger "add:" + parentArrayS, this, newVal, options
              hasAdded = true
            else
              changes[attrS] = newVal
          else
            changes[attrS] = newVal

          if isDeep oldVal or isDeep newVal
            checkChanges oldVal, newVal, attrP

      hasChanged

    function isDeep obj
      _.isObject obj or _.isArray obj



  # note: modifies `newAttrs`
  _setAttr: !(newAttrs, attrPath, newValue, opts || {}) ->
    fullPathLength = attrPath.length
    path = []
    val = newAttrs

    attrsLeft = attrPath.length
    for attr in attrPath
      path.push attr
      attrStr = makeAttrString path
      value = oldValue = val[attr]
      --attrsLeft
      if attrsLeft == 0
        # reached the attribute to be set
        if opts.unset
          delete val[attr]
          delete @_escapedAttributes[attrStr]
        else
          val[attr] = value = newValue
      else unless value
        if _.isNumber(attr)
          val[attr] = value = []
        else
          val[attr] = value = {}

      val = value


# Internal helpers

function makeAttrPath attrStrOrPath
  if attrStrOrPath == ''
    ['']
  else if typeof! attrStrOrPath == \String
    [numericArrayAccessors attr for attr in attrStrOrPath.match(/[^\.\[\]]+/g)]
  else
    attrStrOrPath


# convert array accessors to numbers
function numericArrayAccessors attr
  if attr.match /^\d+$/
    parseInt attr, 10
  else
    attr


function makeAttrString [attrStr, ...rest]
  for attr in rest
    attrStr += if typeof! attr == 'Number' then "[#attr]" else ".#attr"

  attrStr


# Simple version of deep clone. Not as generic as $.deepClone, but probably
# faster.
function deepClone obj
  if _.isArray obj
    a = []
    for own k, v of obj
      a[k] = deepClone v
    a
  else if Object(obj) == obj
    o = {}
    for own k, v of obj
      o[k] = deepClone v
    o
  else
    obj
