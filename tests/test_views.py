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

import httpretty
from flask import url_for

from zenodo_citationformatter.ext import ZenodoCitationFormatter


def test_format(app):
    """Basic format test."""

    ext = ZenodoCitationFormatter(app)
    httpretty.enable()
    httpretty.register_uri(
        httpretty.GET,
        app.config['CITATIONFORMATTER_API'],
        body='my formatted citation',
        content_type="text/plain"
    )

    with app.app_context():
        with app.test_request_context():
            url = url_for('zenodo_citationformatter.format')

    with app.test_client() as client:
        r = client.get(url, query_string=dict(
            doi='10.1234/foo.bar', lang='en-US', style='apa'))
        assert r.status_code == 200
        assert r.get_data(as_text=True) == 'my formatted citation'
    httpretty.disable()


def test_format_invalid_params(app):
    """Test invalid params."""

    ext = ZenodoCitationFormatter(app)
    with app.app_context():
        with app.test_request_context():
            url = url_for('zenodo_citationformatter.format')

    with app.test_client() as client:
        r = client.get(url, query_string=dict(
            doi='invalid-doi', lang='en-US', style='apa')
        )
        assert r.status_code == 404

        r = client.get(url, query_string=dict(
            doi='10.1234/foo.bar', lang='invalidlocale', style='apa')
        )
        assert r.status_code == 404

        r = client.get(url, query_string=dict(
            doi='10.1234/foo.bar', lang='en-US', style='invalidstyle')
        )
        assert r.status_code == 404


def test_format_api_notfound(app):
    """Test not found doi."""

    ext = ZenodoCitationFormatter(app)
    with app.app_context():
        with app.test_request_context():
            url = url_for('zenodo_citationformatter.format')

    with app.test_client() as client:
        httpretty.enable()
        httpretty.register_uri(
            httpretty.GET,
            app.config['CITATIONFORMATTER_API'],
            body='DOI not found',
            content_type="text/plain",
            status=404,
        )

        r = client.get(url, query_string=dict(
            doi='10.1234/foo.bar', lang='en-US', style='apa'))

        assert r.status_code == 404
        httpretty.disable()
