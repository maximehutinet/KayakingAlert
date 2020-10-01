FROM python:2.7-alpine3.10

COPY . /riverapp/

WORKDIR /riverapp

RUN pip install -r requirements.txt

ENV FLASK_APP=__init__

CMD flask run --host=0.0.0.0

EXPOSE 5000