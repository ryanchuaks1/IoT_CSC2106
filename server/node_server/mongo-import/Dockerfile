FROM mongo

ADD https://github.com/vishnubob/wait-for-it/raw/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

WORKDIR /mongo-import
ADD . .
RUN sed -i -e 's/\r$//' mongo_import.sh
ENTRYPOINT ["/wait-for-it.sh", "mongodb:4444", "-t", "100", "--", "./mongo_import.sh"]