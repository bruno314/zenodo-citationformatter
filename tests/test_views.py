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

"""Unit tests for citation formatter views."""

from __future__ import absolute_import

from flask import url_for
from zenodo_citationformatter.views import blueprint
import httpretty




def test_format(app):
    app.config['CACHE_TYPE'] = 'simple'
    app.config['CITATIONFORMATTER_API'] = 'http://example.org/citeproc/format'

    app.register_blueprint(blueprint)

    httpretty.enable()
    httpretty.register_uri(
        httpretty.GET,
        app.config['CITATIONFORMATTER_API'],
        body='my formatted citation',
        content_type="text/plain"
    )

    # for rule in app.url_map.iter_rules():
    #     print (str(rule)+"==="+rule.endpoint)
    # assert False
    with app.test_client() as client:
        with app.app_context() as apc:
            r = client.get(
                    url_for('zenodo_citationformatter.format',
                        doi='10.1234/foo.bar', lang='en-US', style='apa')

            )
            assert r.status_code == 200
            assert r.data == 'my formatted citation'

#
# def test_format_invalid_params(app):
#     r = self.client.get(
#         url_for('zenodo_citationformatter.format',
#                 doi='invalid-doi', lang='en-US', style='apa')
#     )
#     self.assert404(r)
#
#     r = self.client.get(
#         url_for('zenodo_citationformatter.format',
#                 doi='10.1234/foo.bar', lang='invalidlocale', style='apa')
#     )
#     self.assert404(r)
#
#     r = self.client.get(
#         url_for('zenodo_citationformatter.format',
#                 doi='10.1234/foo.bar', lang='en-US', style='invalidstyle')
#     )
#     self.assert404(r)
#
#
# @httpretty.activate
# def test_format_api_notfound(app):
#     httpretty.register_uri(
#         httpretty.GET,
#         self.app.config['CITATIONFORMATTER_API'],
#         body='DOI not found',
#         content_type="text/plain",
#         status=404,
#     )
#
#     r = self.client.get(
#         url_for('zenodo_citationformatter.format',
#                 doi='10.1234/foo.bar', lang='en-US', style='apa')
#     )
#     self.assert404(r)

