import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

export function IsArrayValidDatesConstraint(validationOptions?: ValidationOptions) {
    return (object: Record<string, any>, propertyName: string) => {
        registerDecorator({
            name: 'isArrayValidDates',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!Array.isArray(value)) {
                        return false;
                    }

                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

                    for (const item of value) {
                        if (!dateRegex.test(item)) {
                            return false;
                        }
                    }

                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be an array of valid dates in "YYYY-MM-DD" format`;
                },
            },
        });
    };
}