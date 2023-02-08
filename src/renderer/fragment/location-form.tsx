import { Formik } from "formik";
import React from "react";
import type { Location } from "src/entity/location";

export interface LocationFormOptions {
  location: Location;
  onChange?(location: Location): void;
}

export function LocationForm({ location, onChange }: LocationFormOptions) {
  return (
    <Formik initialValues={location} onSubmit={onChange!}>
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" onChange={handleChange} onBlur={handleBlur} value={values.name} />
          {errors.name && touched.name && errors.name}
        </form>
      )}
    </Formik>
  );
}
