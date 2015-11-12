# -*- coding: utf-8 -*-
#
# This file is part of Zenodo.
# Copyright (C) 2014, 2015 CERN.
#
# Zenodo is free software; you can redistribute it
# and/or modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation; either version 2 of the
# License, or (at your option) any later version.
#
# Zenodo is distributed in the hope that it will be
# useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Zenodo; if not, write to the
# Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston,
# MA 02111-1307, USA.
#
# In applying this license, CERN does not
# waive the privileges and immunities granted to it by virtue of its status
# as an Intergovernmental Organization or submit itself to any jurisdiction.

"""."""

import requests
from flask import Blueprint, request, current_app, abort
from idutils import is_doi

blueprint = Blueprint(
    'zenodo_citationformatter',
    __name__,
    url_prefix="/citeproc",
    static_folder="static",
    template_folder="templates",
)


@blueprint.route('/format', methods=['GET'])
def format():
    """."""
    doi = request.args.get('doi', '')
    lang = request.args.get(
        'lang', current_app.config['CITATIONFORMATTER_DEFAULT_LANG'])
    style = request.args.get(
        'style', current_app.config['CITATIONFORMATTER_DEFAULT_STYLE'])

    # Abort early on invalid DOI.
    if not is_doi(doi):
        abort(404, "DOI not found.")
    if lang not in current_app.config['CITATIONFORMATTER_LANGS']:
        abort(404, "Language not found.")
    if style not in current_app.config['CITATIONFORMATTER_STYLES']:
        abort(404, "Style not found.")

    r = requests.get(
        current_app.config['CITATIONFORMATTER_API'],
        params=dict(
            doi=doi,
            lang=lang,
            style=style,
        )
    )
    r.encoding = 'utf-8'

    if r.status_code == 200:
        return (r.text, 200, [('content-type', 'text/plain')])
    else:
        abort(404, "DOI not found")
