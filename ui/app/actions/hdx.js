import axios from "axios";
import cookie from "react-cookie";
import { push } from "react-router-redux";
import { startSubmit, stopSubmit } from "redux-form";

import types from ".";
import { selectLocationOptions } from "../selectors";

const launderExportRegion = exportRegion => {
  if (exportRegion.last_run != null) {
    exportRegion.last_run = new Date(exportRegion.last_run);
  }

  if (exportRegion.next_run != null) {
    exportRegion.next_run = new Date(exportRegion.next_run);
  }

  exportRegion.simplified_geom.id = exportRegion.id;

  return exportRegion;
};

export function getExportRegions(page = 1) {
  const itemsPerPage = 5;

  return dispatch => {
    dispatch({
      type: types.FETCHING_EXPORT_REGIONS
    });

    return axios({
      params: {
        limit: itemsPerPage,
        offset: Math.max(0, (page - 1) * itemsPerPage)
      },
      url: "/api/hdx_export_regions"
    })
      .then(rsp => {
        const exportRegions = rsp.data.results.map(launderExportRegion);

        dispatch({
          type: types.RECEIVED_EXPORT_REGIONS,
          activePage: page,
          itemsPerPage,
          response: {
            count: rsp.data.count,
            results: exportRegions
          }
        });
      })
      .catch(error => {
        dispatch({
          type: types.FETCH_EXPORT_REGIONS_ERROR,
          error,
          statusCode: error.response && error.response.status
        });
      });
  };
}

export function getExportRegion(id) {
  return dispatch => {
    dispatch({
      type: types.FETCHING_EXPORT_REGION,
      id
    });

    return axios
      .get(`/api/hdx_export_regions/${id}`)
      .then(rsp => rsp.data)
      .then(launderExportRegion)
      .then(exportRegion => {
        dispatch({
          type: types.RECEIVED_EXPORT_REGION,
          id,
          exportRegion
        });
      })
      .catch(error => {
        dispatch({
          type: types.FETCH_EXPORT_REGIONS_ERROR,
          id,
          error,
          statusCode: error.response && error.response.status
        });
      });
  };
}

export function runExport(id, jobUid) {
  return dispatch => {
    dispatch({
      type: types.STARTING_EXPORT_REGION_RUN,
      id
    });

    return axios({
      url: `/api/runs?job_uid=${jobUid}`,
      method: "POST",
      headers: {
        "X-CSRFToken": cookie.load("csrftoken")
      }
    })
      .then(rsp =>
        dispatch({
          type: types.EXPORT_REGION_RUN_STARTED,
          id
        })
      )
      .then(() => dispatch(getExportRegion(id)))
      .catch(error =>
        dispatch({
          type: types.EXPORT_REGION_RUN_ERROR,
          id,
          error,
          statusCode: error.response && error.response.status
        })
      );
  };
}

export function deleteExportRegion(id) {
  return dispatch => {
    dispatch({
      type: types.STARTING_EXPORT_REGION_DELETE,
      id
    });

    return axios({
      url: `/api/hdx_export_regions/${id}`,
      method: "DELETE",
      headers: {
        "X-CSRFToken": cookie.load("csrftoken")
      }
    })
      .then(rsp =>
        dispatch({
          type: types.EXPORT_REGION_DELETED,
          id
        })
      )
      .catch(error =>
        dispatch({
          type: types.DELETE_EXPORT_REGION_ERROR,
          id,
          error,
          statusCode: error.response && error.response.status
        })
      );
  };
}

export function zoomToExportRegion(id) {
  return dispatch =>
    dispatch({
      type: types.ZOOM_TO_EXPORT_REGION,
      id
    });
}

export function createExportRegion(data, form) {
  return dispatch => {
    dispatch(startSubmit(form));
    return axios({
      url: "/api/hdx_export_regions",
      method: "POST",
      contentType: "application/json; version=1.0",
      data,
      headers: {
        "X-CSRFToken": cookie.load("csrftoken")
      }
    })
      .then(rsp => {
        console.log("Success");

        console.log("id:", rsp.data.id);

        dispatch(stopSubmit(form));

        dispatch({
          type: types.EXPORT_REGION_CREATED,
          id: data.id,
          exportRegion: rsp.data
        });

        dispatch(push(`/hdx/edit/${rsp.data.id}`));
      })
      .catch(err => {
        console.warn(err);

        if (err.response) {
          var msg =
            "Your export region is invalid. Please check the fields above.";
          if ("the_geom" in err.response.data) {
            msg += " Choose an area to the right.";
          }
          return dispatch(
            stopSubmit(form, {
              ...err.response.data,
              _error: msg
            })
          );
        }

        return dispatch(
          stopSubmit(form, {
            _error: "Export region creation failed."
          })
        );
      });
  };
}

export function updateExportRegion(id, data, form) {
  // TODO this is practically identical to createExportRegion
  return dispatch => {
    dispatch(startSubmit(form));

    return axios({
      url: `/api/hdx_export_regions/${id}`,
      method: "PUT",
      contentType: "application/json; version=1.0",
      data,
      headers: {
        "X-CSRFToken": cookie.load("csrftoken")
      }
    })
      .then(rsp => {
        console.log("Success");

        dispatch(stopSubmit(form));

        dispatch({
          type: types.EXPORT_REGION_UPDATED,
          id,
          exportRegion: rsp.data
        });
      })
      .catch(err => {
        console.warn(err);

        if (err.response) {
          return dispatch(
            stopSubmit(form, {
              ...err.response.data,
              _error:
                "Your export region is invalid. Please check the fields above."
            })
          );
        }

        return dispatch(
          stopSubmit(form, {
            _error: "Export region creation failed."
          })
        );
      });
  };
}

export const getLocationOptions = () => (dispatch, getState) => {
  if (selectLocationOptions(getState()) != null) {
    return;
  }

  dispatch({
    type: types.FETCHING_LOCATION_OPTIONS
  });

  return axios(
    "https://data.humdata.org/api/3/action/group_list?all_fields=true"
  )
    .then(rsp =>
      dispatch({
        type: types.RECEIVED_LOCATION_OPTIONS,
        locationOptions: rsp.data.result
          .filter(x => x.approval_status === "approved")
          .map(x => ({
            value: x.name,
            label: x.title
          }))
      })
    )
    .catch(error =>
      dispatch({
        type: types.FETCHING_LOCATION_OPTIONS_FAILED,
        error
      })
    );
};