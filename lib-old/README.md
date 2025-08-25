# Preparing the Environment

The most productive way I found to have the last Mundorum Collection libraries updated is to clone the Mundorum Collection repository. Inside a directory `/home/user/git/` clone it:

~~~
git clone https://github.com/mundorum/collections.git
~~~

`/home/user/git/` is a hypothetical directory you must update to your machine.

Map the `full` folder in this directory to the `/lib/full` folder of the Mundorum Collections repository:

~~ 
ln -s /home/user/git/collections/lib/full/ full
~~~

ln -s /home/santanche/git/mundorum/collections/lib/full/ full