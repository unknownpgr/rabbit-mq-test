FROM python:3.8

WORKDIR /app
RUN python -m pip install pika --upgrade
RUN python -m pip install flask --upgrade
COPY src ./

ENTRYPOINT [ "python", "app.py" ]