import { _t, exists, addResourceBundle } from './index';
const yaml = require('js-yaml')
const _ = require("underscore");
const clone = require("clone");

const KEYSEPARATOR: string = '_';

//translation 为默认的命名空间
const OBJECT_NS = 'translation'; // objects

const objectT = function(key , lng){
    let options: any = {lng: lng, ns: OBJECT_NS}
    if(KEYSEPARATOR === '.'){
        options.keySeparator = false
    }
    if(exists(key, options)){
        return _t(key, options)
    }
}

const getObjectLabelKey = function(objectName){
    return `${objectName}__object`;
}

const getObjectFieldLabelKey = function(objectName, name){
    return `${objectName}${KEYSEPARATOR}field${KEYSEPARATOR}${name}`
}

//TODO ${objectName}_group_${key}
const getObjectFieldGroupKey = function(objectName, name){
    //转小写后，替换掉 % . 空格
    let groupKey = name.toLocaleLowerCase().replace(/\%/g, '_').replace(/\./g, '_').replace(/\ /g, '_')
    return `${objectName}${KEYSEPARATOR}group${KEYSEPARATOR}${groupKey}`
}

const getObjectFieldOptionsLabelKey = function(objectName, name, value){
    return `${objectName}${KEYSEPARATOR}field${KEYSEPARATOR}${name}${KEYSEPARATOR}options${KEYSEPARATOR}${value}`
}

const getObjectActionLabelKey = function(objectName, name){
    return `${objectName}${KEYSEPARATOR}action${KEYSEPARATOR}${name}`
}

const getObjectListviewLabelKey = function(objectName, name){
    return `${objectName}${KEYSEPARATOR}listview${KEYSEPARATOR}${name}`
}

//TODO picklists,picklist_options objects
// const getObjectPicklistLabelKey = function(){

// }


const getObjectLabel = function(lng, name, def){
    let key = getObjectLabelKey(name);
    return objectT(key, lng) || def || ''
}

const getObjectFieldLabel = function(lng, objectName, name, def){
    let key = getObjectFieldLabelKey(objectName, name);
    return objectT(key, lng) || def || ''
}

const getObjectFieldGroup = function(lng, objectName, name, def){
    let key = getObjectFieldGroupKey(objectName, name);
    return objectT(key, lng) || def || ''
}

const getObjectFieldOptionsLabel = function(lng, objectName, name, value, def){
    let key = getObjectFieldOptionsLabelKey(objectName, name, value);
    return objectT(key, lng) || def || ''
}


const getObjectActionLabel = function(lng, objectName, name, def){
    let key = getObjectActionLabelKey(objectName, name);
    return objectT(key, lng) || def || ''
}

const getObjectListviewLabel = function(lng, objectName, name, def){
    let key = getObjectListviewLabelKey(objectName, name);
    return objectT(key, lng) || def || ''
}

const getOption = function (option) {
    var foo;
    foo = option.split(":");
    if (foo.length > 1) {
        return {
            label: foo[0],
            value: foo[1]
        };
    } else {
        return {
            label: foo[0],
            value: foo[0]
        };
    }
};

const convertObject = function (object: StringMap) {
    _.forEach(object.fields, function (field, key) {
        let _options = [];
        if (field.options && _.isString(field.options)) {
            try {
                //支持\n或者英文逗号分割,
                _.forEach(field.options.split("\n"), function (option) {
                    var options;
                    if (option.indexOf(",")) {
                        options = option.split(",");
                        return _.forEach(options, function (_option) {
                            return _options.push(getOption(_option));
                        });
                    } else {
                        return _options.push(getOption(option));
                    }
                });
                field.options = _options;
            } catch (error) {
                console.error("convertFieldsOptions error: ", field.options, error);
            }
        } else if (field.options && !_.isFunction(field.options) && !_.isArray(field.options) && _.isObject(field.options)) {
            _.each(field.options, function (v, k) {
                return _options.push({
                    label: v,
                    value: k
                });
            });
            field.options = _options;
        }
    })
}

//TODO 处理继承字段base, core 的字段
const translationObject = function(lng: string, objectName: string, _object: StringMap){
    let object = clone(_object);
    convertObject(object);
    object.label = getObjectLabel(lng, objectName, object.label);
    _.each(object.fields, function(field, fieldName){
        field.label = getObjectFieldLabel(lng, objectName, fieldName, field.label);
        if(field.group){
            field.group = getObjectFieldGroup(lng, objectName, field.group, field.group);
        }
        if(field.options){
            let _options = [];
            _.each(field.options, function(op){
                if(_.has(op, 'value')){
                    let _label = getObjectFieldOptionsLabel(lng, objectName, fieldName, op.value, op.label) 
                    _options.push({value: op.value, label: _label})
                }else{
                    _options.push(op)
                }
            })
            field.options = _options;
        }
    })

    _.each(object.actions, function(action, actionName){
        action.label = getObjectActionLabel(lng, objectName, actionName, action.label);
    })

    _.each(object.list_views, function(list_view, viewName){
        list_view.label = getObjectListviewLabel(lng, objectName, viewName, list_view.label);
    })
}

export const addObjectsI18n = function(i18nArray){
    _.each(i18nArray, function(item){
        addResourceBundle(item.lng, OBJECT_NS, item.data, true, true);
    })
}

export const translationObjects = function(lng: string, objects: StringMap){
    _.each(objects, function(object, name){
        translationObject(lng, name, object);
    })
}

export const getObjectI18nTemplate = function(lng: string ,objectName: string, _object: StringMap){
    let object = clone(_object);
    convertObject(object);
    let template = {};
    template[getObjectLabelKey(objectName)] = getObjectLabel(lng, objectName, object.label);
    _.each(object.fields, function(field, fieldName){
        template[getObjectFieldLabelKey(objectName, fieldName)] = getObjectFieldLabel(lng, objectName, fieldName, field.label);
        if(field.group){
            template[getObjectFieldGroupKey(objectName, field.group)] = getObjectFieldGroup(lng, objectName, field.group, field.group);
        }
        if(field.options){
            _.each(field.options, function(op){
                if(_.has(op, 'value')){
                    template[getObjectFieldOptionsLabelKey(objectName, fieldName, op.value)] = getObjectFieldOptionsLabel(lng, objectName, fieldName, op.value, op.label);
                }
            })
        }
    })

    _.each(object.actions, function(action, actionName){
        template[getObjectActionLabelKey( objectName, actionName)] = getObjectActionLabel(lng, objectName, actionName, action.label);
    })

    _.each(object.list_views, function(list_view, viewName){
        template[getObjectListviewLabelKey(objectName, viewName)] = getObjectListviewLabel(lng, objectName, viewName, list_view.label);
    })

    return template;
}

export const toYml = function(date: StringMap){
    return yaml.dump(date, {sortKeys: true}).replace(/: ''/g, ': ');
}