FROM golang:latest

LABEL base.name="collabify"

WORKDIR /

COPY . .

RUN go build -o main .

EXPOSE 8080

ENTRYPOINT [ "./main" ]