########################################################################################
# Parametri statici
require(jsonlite) # to read json configuration file from webserver
set.seed(12345)
########################################################################################

########################################################################################
# Server path is used for store the csv files resulting
serverPath = "~/website/cache/"
# take arguments from python subprocess
myArgs <- commandArgs(trailingOnly = TRUE)
# creation json object received from command line
jsonConfig = fromJSON(myArgs)
# extract from json by key the csv file name
csvname = jsonConfig$csvName # nome file csv
# extract from json by key 'directory' the name of directory for save the result files
directoryName = jsonConfig$directory # nome cartella per salvare file results
########################################################################################

########################################################################################
# Parametri ricevuti in ingresso da utente
# Historic series plot selection
Historic_series_plot = jsonConfig$parameters$Historic_series_plot$parameters
# Linear regression plot selection
Linear_regression_plot = jsonConfig$parameters$Linear_regression_plot$parameters
########################################################################################

filename = paste(serverPath, directoryName, sep = '')
wd = paste(filename, '/cache/', sep = '')
setwd(wd)

# Lettura file Csv
# the serverPath should be provided or chosen by the user
filename = paste(serverPath, directoryName, sep = '')
filename = paste(filename, '/cache/', sep = '')
filename = paste(filename, csvname, sep = '')
csvfile = read.csv(filename);

X <- ts(csvfile$Interpolated, start = 1958, frequency = 12)

len <- length(X)
Z <- c(1: len)

#linear regression
reg <- lm(X ~ Z)

# Creo una correlazione tra le due variabili
cor(X,Z)

# Costruisco la retta del coefficiente angolare
# partendo dai coefficienti generati dalla regressione
F <- (0:7270)/10
# Costruiamo la retta con coefficiente angolare reg$coefficient[2]
m <- reg$coefficient[2]
q <- reg$coefficient[1]
Y = m * F + q



##################################################################################
# Salvo i file risultati
filename = paste(serverPath , directoryName, sep = '')
filename = paste(filename, "/results/summary.csv", sep = '')
write.csv(coef(summary(reg)), file = filename)

if (Historic_series_plot == "Yes"){
  filename = paste(serverPath , directoryName, sep = '')
  filename = paste(filename, "/results/Historic_Series.pdf", sep = '')
  pdf(filename)
  plot(X)
  acf(X)
  dev.off()
}

if (Linear_regression_plot == "Yes"){
  filename = paste(serverPath , directoryName, sep = '')
  filename = paste(filename, "/results/linearModel.pdf", sep = '')
  pdf(filename)
  plot(reg)
  # Il comando lines permette di sovrapporre un grafico ad un altro grafico 
  lines(F,Y)
  dev.off()
}
##################################################################################