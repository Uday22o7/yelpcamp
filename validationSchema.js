// validationSchema.js
const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//! The validation file in the course is different than the validation file in our code as when ever he creates a campground they send all the info 
//! of a perticular camp in a array but we are sending it directly so we donot need "Campground : Joi.object()" this line  
//* Here we have created a extended method of the Joe to include more validation, so that hacker are not able to do cross site scripting on the website.
//* We have also used a new package called sanitize-html to santize the html and not allow the html as this method sanitizeHtml(value) remove html from the value.   

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)


const campgroundSchema = Joi.object({
    // Campground : Joi.object()  
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
    // we have added this so that we can send the deleteImages array through edit form 
    deleteImages: Joi.array()
})

const reviewSchema = Joi.object({
    body: Joi.string().required().escapeHTML(),
    rating: Joi.number().required()
}).required();
module.exports = { campgroundSchema, reviewSchema };

// here we have used a dependency called joi which is used for checking validation here we write the schema in this why
// and if any this is wrong in schema they joi returns error messg  