import * as _ from 'lodash';

/**
 * Returns true if the value is serializable to JSON.
 *
 * @param value Value.
 */
export function isJSONSerializable(value: any): boolean {
    return _.isEqual(JSON.parse(JSON.stringify(value)), value);
}
